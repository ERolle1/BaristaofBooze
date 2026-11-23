import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import styles from "./partyMenu.module.css";
import {
  getPartyMenuPath,
  usePartyMenu,
} from "../../hooks/usePartyMenu";

const API_URL = "https://www.thecocktaildb.com/api/json/v1/1";
const CHECKLIST_STORAGE_KEY = "barista-party-menu-checklist";
const MAX_MENU_DRINKS = 10;

const foodPairings = [
  {
    ingredients: ["tequila"],
    foods: ["Tacos", "Ceviche", "Chips with guacamole"],
  },
  {
    ingredients: ["rum"],
    foods: ["Jerk chicken", "Coconut shrimp", "Grilled pineapple"],
  },
  {
    ingredients: ["gin"],
    foods: ["Smoked salmon crostini", "Goat cheese salad", "Marinated olives"],
  },
  {
    ingredients: ["whiskey", "bourbon"],
    foods: ["Barbecue sliders", "Aged cheddar", "Dark chocolate"],
  },
  {
    ingredients: ["vodka"],
    foods: ["Smoked salmon blini", "Pickled vegetables", "Potato bites"],
  },
];

function readChecklist() {
  try {
    const savedChecklist = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!savedChecklist) return {};

    const parsedChecklist = JSON.parse(savedChecklist);
    if (
      parsedChecklist &&
      typeof parsedChecklist === "object" &&
      !Array.isArray(parsedChecklist)
    ) {
      return parsedChecklist;
    }

    console.error("Saved party checklist has an invalid format.");
  } catch (error) {
    console.error("Could not read the saved party checklist.", error);
  }
  return {};
}

function getIngredients(drink) {
  const ingredients = [];
  for (let index = 1; index <= 15; index++) {
    const name = drink[`strIngredient${index}`]?.trim();
    if (name) {
      ingredients.push({
        name,
        measure: drink[`strMeasure${index}`]?.trim() || "",
      });
    }
  }
  return ingredients;
}

function getFoodPairings(drink) {
  const ingredients = getIngredients(drink).map((item) =>
    item.name.toLowerCase(),
  );
  const pairing = foodPairings.find((option) =>
    option.ingredients.some((term) =>
      ingredients.some((ingredient) => ingredient.includes(term)),
    ),
  );

  return (
    pairing?.foods || [
      "Charcuterie board",
      "Spiced nuts",
      "Mini savory tarts",
    ]
  );
}

export const PartyMenu = () => {
  const { ids } = useParams();
  const navigate = useNavigate();
  const drinkIds = [...new Set((ids || "").split(",").filter(Boolean))];
  const { updateDrinkIds } = usePartyMenu();
  const [drinks, setDrinks] = useState([]);
  const [expandedDrinkIds, setExpandedDrinkIds] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [checkedIngredients, setCheckedIngredients] = useState(readChecklist);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  useEffect(() => {
    if (ids !== undefined) {
      updateDrinkIds([...new Set(ids.split(",").filter(Boolean))]);
    }
  }, [ids, updateDrinkIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CHECKLIST_STORAGE_KEY,
        JSON.stringify(checkedIngredients),
      );
    } catch (error) {
      console.error("Could not save the party checklist.", error);
    }
  }, [checkedIngredients]);

  useEffect(() => {
    let active = true;

    async function fetchDrinks() {
      const menuDrinkIds = [
        ...new Set((ids || "").split(",").filter(Boolean)),
      ];
      setIsLoadingMenu(true);
      setMenuError("");

      if (!menuDrinkIds.length) {
        setDrinks([]);
        setIsLoadingMenu(false);
        return;
      }

      try {
        const responses = await Promise.all(
          menuDrinkIds.map(async (id) => {
            const response = await fetch(
              `${API_URL}/lookup.php?i=${encodeURIComponent(id)}`,
            );
            if (!response.ok) {
              throw new Error(
                `Could not load drink ${id} (status ${response.status})`,
              );
            }
            return response.json();
          }),
        );

        if (active) {
          setDrinks(
            responses.map((data) => data.drinks?.[0]).filter(Boolean),
          );
        }
      } catch (error) {
        console.error("Could not load the party menu.", error);
        if (active) setMenuError("Could not load this menu. Please try again.");
      } finally {
        if (active) setIsLoadingMenu(false);
      }
    }

    fetchDrinks();
    return () => {
      active = false;
    };
  }, [ids]);

  const searchDrinks = async (event) => {
    event.preventDefault();
    const query = searchInput.trim();
    if (!query || isSearching) return;

    setIsSearching(true);
    setSearchMessage("");
    setSearchResults([]);
    try {
      const response = await fetch(
        `${API_URL}/search.php?s=${encodeURIComponent(query)}`,
      );
      if (!response.ok) {
        throw new Error(`Drink search failed with status ${response.status}`);
      }

      const data = await response.json();
      const results = data.drinks || [];
      setSearchResults(results);
      if (!results.length) setSearchMessage(`No drinks found for "${query}".`);
    } catch (error) {
      console.error("Could not search for party menu drinks.", error);
      setSearchMessage("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const addDrink = (drink) => {
    if (drinkIds.includes(drink.idDrink)) {
      setSearchMessage(`${drink.strDrink} is already on the menu.`);
      return;
    }
    if (drinkIds.length >= MAX_MENU_DRINKS) {
      setSearchMessage(`A menu can contain up to ${MAX_MENU_DRINKS} drinks.`);
      return;
    }

    const nextIds = [...drinkIds, drink.idDrink];
    updateDrinkIds(nextIds);
    navigate(getPartyMenuPath(nextIds), { replace: true });
    setSearchMessage(`${drink.strDrink} added to the menu.`);
  };

  const removeDrink = (id) => {
    const nextIds = drinkIds.filter((drinkId) => drinkId !== id);
    updateDrinkIds(nextIds);
    navigate(getPartyMenuPath(nextIds), { replace: true });
  };

  const toggleRecipe = (id) => {
    setExpandedDrinkIds((current) =>
      current.includes(id)
        ? current.filter((drinkId) => drinkId !== id)
        : [...current, id],
    );
  };

  const toggleIngredient = (drinkId, index) => {
    setCheckedIngredients((current) => ({
      ...current,
      [drinkId]: {
        ...(current[drinkId] || {}),
        [index]: !current[drinkId]?.[index],
      },
    }));
  };

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.kicker}>Barista of Booze</p>
        <h1>Tonight&apos;s Cocktail Menu</h1>
        <p className={styles.count}>
          {drinkIds.length} {drinkIds.length === 1 ? "drink" : "drinks"} on the
          menu
        </p>
        <Link className={styles.homeLink} to="/">
          Back to homepage
        </Link>
      </header>

      <div className={styles.layout}>
        <section className={styles.menu} aria-label="Party menu drinks">
          {isLoadingMenu && <p className={styles.status}>Loading menu...</p>}
          {menuError && <p className={styles.status}>{menuError}</p>}
          {!isLoadingMenu && !menuError && drinks.length === 0 && (
            <p className={styles.emptyState}>
              Your menu is empty. Search for a drink to add it.
            </p>
          )}

          {drinks.map((drink) => {
            const ingredients = getIngredients(drink);
            return (
              <article key={drink.idDrink} className={styles.drink}>
                <div className={styles.drinkHeader}>
                  <img
                    src={drink.strDrinkThumb}
                    alt={`${drink.strDrink} cocktail`}
                    className={styles.image}
                    loading="lazy"
                  />
                  <div className={styles.info}>
                    <h2>{drink.strDrink}</h2>
                    <p className={styles.instructions}>
                      {drink.strInstructions}
                    </p>
                    <button
                      type="button"
                      className={styles.recipeToggle}
                      aria-expanded={expandedDrinkIds.includes(drink.idDrink)}
                      aria-controls={`full-recipe-${drink.idDrink}`}
                      onClick={() => toggleRecipe(drink.idDrink)}
                    >
                      {expandedDrinkIds.includes(drink.idDrink)
                        ? "Hide full recipe ↑"
                        : "View full recipe ↓"}
                    </button>
                  </div>
                  <button
                    className={styles.removeButton}
                    type="button"
                    onClick={() => removeDrink(drink.idDrink)}
                    aria-label={`Remove ${drink.strDrink} from the menu`}
                  >
                    Remove
                  </button>
                </div>

                <div
                  id={`full-recipe-${drink.idDrink}`}
                  className={`${styles.recipePanel} ${
                    expandedDrinkIds.includes(drink.idDrink)
                      ? styles.recipePanelOpen
                      : ""
                  }`}
                  aria-hidden={!expandedDrinkIds.includes(drink.idDrink)}
                >
                  <div className={styles.recipeContent}>
                    <h3>Full recipe</h3>
                    <h4>Ingredients</h4>
                    <ul>
                      {ingredients.map((ingredient, index) => (
                        <li key={`recipe-${drink.idDrink}-${index}`}>
                          {ingredient.measure && (
                            <span>{ingredient.measure} </span>
                          )}
                          {ingredient.name}
                        </li>
                      ))}
                    </ul>
                    <h4>Instructions</h4>
                    <p>{drink.strInstructions}</p>
                  </div>
                </div>

                <section className={styles.ingredientsSection}>
                  <h3>Shopping checklist</h3>
                  <ul className={styles.ingredientList}>
                    {ingredients.map((ingredient, index) => (
                      <li key={`${drink.idDrink}-${index}`}>
                        <label className={styles.ingredient}>
                          <input
                            type="checkbox"
                            checked={
                              checkedIngredients[drink.idDrink]?.[index] ||
                              false
                            }
                            onChange={() =>
                              toggleIngredient(drink.idDrink, index)
                            }
                          />
                          <span>
                            <strong>{ingredient.name}</strong>
                            {ingredient.measure && (
                              <span className={styles.measure}>
                                {ingredient.measure}
                              </span>
                            )}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className={styles.pairings}>
                  <h3>Food pairings</h3>
                  <ul>
                    {getFoodPairings(drink).map((food) => (
                      <li key={food}>{food}</li>
                    ))}
                  </ul>
                </section>
              </article>
            );
          })}
        </section>

        <aside className={styles.addDrink}>
          <h2>Add another drink</h2>
          <p>Search by cocktail name and add a match to your menu.</p>
          <form className={styles.searchForm} onSubmit={searchDrinks}>
            <label htmlFor="party-drink-search">Drink name</label>
            <input
              id="party-drink-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="e.g. Margarita"
            />
            <button type="submit" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search drinks"}
            </button>
          </form>

          {searchMessage && (
            <p className={styles.searchMessage} role="status">
              {searchMessage}
            </p>
          )}
          {searchResults.length > 0 && (
            <ul className={styles.searchResults}>
              {searchResults.map((drink) => {
                const isOnMenu = drinkIds.includes(drink.idDrink);
                return (
                  <li key={drink.idDrink} className={styles.searchResult}>
                    <img src={drink.strDrinkThumb} alt="" loading="lazy" />
                    <span>{drink.strDrink}</span>
                    <button
                      type="button"
                      onClick={() => addDrink(drink)}
                      disabled={isOnMenu || drinkIds.length >= MAX_MENU_DRINKS}
                    >
                      {isOnMenu ? "Added" : "Add"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
};
