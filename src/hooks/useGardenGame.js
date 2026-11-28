import { useEffect, useState } from "react";

const STORAGE_KEY = "barista-study-garden";
const PLOT_COUNT = 4;

const emptyGarden = () => ({
  points: 0,
  seeds: 0,
  hasWateringCan: false,
  plants: Array(PLOT_COUNT).fill(null),
});

function readGarden() {
  try {
    const savedGarden = window.localStorage.getItem(STORAGE_KEY);
    if (!savedGarden) return emptyGarden();

    const parsedGarden = JSON.parse(savedGarden);
    if (!parsedGarden || typeof parsedGarden !== "object") {
      console.error("Saved study garden has an invalid format.");
      return emptyGarden();
    }

    return {
      points:
        Number.isSafeInteger(parsedGarden.points) && parsedGarden.points >= 0
          ? parsedGarden.points
          : 0,
      seeds:
        Number.isSafeInteger(parsedGarden.seeds) && parsedGarden.seeds >= 0
          ? parsedGarden.seeds
          : 0,
      hasWateringCan: parsedGarden.hasWateringCan === true,
      plants: Array.from({ length: PLOT_COUNT }, (_, index) =>
        parsedGarden.plants?.[index] === "sprout" ||
        parsedGarden.plants?.[index] === "bloom"
          ? parsedGarden.plants[index]
          : null,
      ),
    };
  } catch (error) {
    console.error("Could not read the study garden.", error);
    return emptyGarden();
  }
}

export function useGardenGame() {
  const [garden, setGarden] = useState(readGarden);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(garden));
    } catch (error) {
      console.error("Could not save the study garden.", error);
    }
  }, [garden]);

  const awardPoints = (points) => {
    setGarden((current) => ({ ...current, points: current.points + points }));
  };

  const buySeeds = () => {
    setGarden((current) =>
      current.points < 20
        ? current
        : { ...current, points: current.points - 20, seeds: current.seeds + 1 },
    );
  };

  const buyWateringCan = () => {
    setGarden((current) =>
      current.points < 40 || current.hasWateringCan
        ? current
        : { ...current, points: current.points - 40, hasWateringCan: true },
    );
  };

  const plantSeed = (plotIndex) => {
    setGarden((current) => {
      if (current.seeds < 1 || current.plants[plotIndex] !== null) return current;

      const plants = [...current.plants];
      plants[plotIndex] = "sprout";
      return { ...current, seeds: current.seeds - 1, plants };
    });
  };

  const waterPlant = (plotIndex) => {
    setGarden((current) => {
      if (!current.hasWateringCan || current.plants[plotIndex] !== "sprout") {
        return current;
      }

      const plants = [...current.plants];
      plants[plotIndex] = "bloom";
      return { ...current, plants };
    });
  };

  return { garden, awardPoints, buySeeds, buyWateringCan, plantSeed, waterPlant };
}
