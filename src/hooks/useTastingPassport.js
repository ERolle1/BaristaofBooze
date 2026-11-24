import { useEffect, useState } from "react";

const STORAGE_KEY = "barista-tasting-passport";

function readPassport() {
  try {
    const savedPassport = window.localStorage.getItem(STORAGE_KEY);
    if (!savedPassport) return {};

    const parsedPassport = JSON.parse(savedPassport);
    if (
      parsedPassport &&
      typeof parsedPassport === "object" &&
      !Array.isArray(parsedPassport)
    ) {
      return Object.fromEntries(
        Object.entries(parsedPassport)
          .filter(
            ([drinkId, record]) =>
              /^\d+$/.test(drinkId) &&
              record &&
              typeof record === "object" &&
              !Array.isArray(record),
          )
          .map(([drinkId, record]) => [
            drinkId,
            {
              made: record.made === true,
              name: typeof record.name === "string" ? record.name : "",
              category:
                typeof record.category === "string" ? record.category : "",
              alcoholic:
                typeof record.alcoholic === "string" ? record.alcoholic : "",
              rating:
                Number.isInteger(record.rating) &&
                record.rating >= 0 &&
                record.rating <= 5
                  ? record.rating
                  : 0,
              notes: typeof record.notes === "string" ? record.notes : "",
            },
          ]),
      );
    }

    console.error("Saved tasting passport has an invalid format.");
  } catch (error) {
    console.error("Could not read the tasting passport.", error);
  }
  return {};
}

export function useTastingPassport() {
  const [records, setRecords] = useState(readPassport);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("Could not save the tasting passport.", error);
    }
  }, [records]);

  const updateRecord = (drinkId, updates) => {
    setRecords((current) => ({
      ...current,
      [drinkId]: { ...(current[drinkId] || {}), ...updates },
    }));
  };

  return { records, updateRecord };
}
