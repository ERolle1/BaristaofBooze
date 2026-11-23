import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "barista-party-menu-drinks";
const MENU_UPDATED_EVENT = "barista-party-menu-updated";

function readPartyMenuIds() {
  try {
    const savedIds = window.localStorage.getItem(STORAGE_KEY);
    if (!savedIds) return [];

    const parsedIds = JSON.parse(savedIds);
    if (
      Array.isArray(parsedIds) &&
      parsedIds.every((id) => typeof id === "string" && /^\d+$/.test(id))
    ) {
      return [...new Set(parsedIds)];
    }

    console.error("Saved party menu has an invalid format.");
  } catch (error) {
    console.error("Could not read the saved party menu.", error);
  }
  return [];
}

export const getPartyMenuPath = (drinkIds) =>
  drinkIds.length ? `/party-menu/${drinkIds.join(",")}` : "/party-menu";

export const usePartyMenu = () => {
  const [drinkIds, setDrinkIds] = useState(readPartyMenuIds);

  useEffect(() => {
    const syncPartyMenu = () => {
      const savedIds = readPartyMenuIds();
      setDrinkIds((currentIds) =>
        currentIds.length === savedIds.length &&
        currentIds.every((id, index) => id === savedIds[index])
          ? currentIds
          : savedIds,
      );
    };

    window.addEventListener(MENU_UPDATED_EVENT, syncPartyMenu);
    window.addEventListener("storage", syncPartyMenu);
    return () => {
      window.removeEventListener(MENU_UPDATED_EVENT, syncPartyMenu);
      window.removeEventListener("storage", syncPartyMenu);
    };
  }, []);

  const updateDrinkIds = useCallback((nextIds) => {
    const uniqueIds = [...new Set(nextIds)];
    setDrinkIds(uniqueIds);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueIds));
    } catch (error) {
      console.error("Could not save the party menu.", error);
    }
    window.dispatchEvent(new Event(MENU_UPDATED_EVENT));
  }, []);

  return { drinkIds, updateDrinkIds };
};
