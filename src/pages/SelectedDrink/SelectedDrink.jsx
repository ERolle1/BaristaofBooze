import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import styles from "../SelectedDrink/selecteddrink.module.css";
import { Navbar } from "../../containers/Navbar/Navbar";
import {
  getPartyMenuPath,
  usePartyMenu,
} from "../../hooks/usePartyMenu";

export const SelectedDrink = () => {
  //  GET ID FROM PARAM
  const params = useParams();

  const [selectedData, setSelectedData] = useState(null);
  const [suggestedDrinks, setSuggestedDrinks] = useState([]);
  const [guestCount, setGuestCount] = useState(8);
  const { drinkIds: partyMenuIds, updateDrinkIds } = usePartyMenu();
  const [partyMenuMessage, setPartyMenuMessage] = useState("");

  useEffect(() => {
    async function fetchSelected() {
      setSelectedData(null);
      setSuggestedDrinks([]);

      const response = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${params.id}`,
      );
      const data = await response.json();

      const info = data.drinks[0];
      setSelectedData(info);

      if (info?.strCategory) {
        const suggestionsResponse = await fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(info.strCategory)}`,
        );
        const suggestionsData = await suggestionsResponse.json();
        setSuggestedDrinks(
          (suggestionsData.drinks || [])
            .filter((drink) => drink.idDrink !== info.idDrink)
            .slice(0, 5),
        );
      }
    }

    fetchSelected();
  }, [params.id]);
  // INGREDIENTS AND MEASUREMENTS

  const getIngredients = (drink) => {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = drink[`strIngredient${i}`];
      const measure = drink[`strMeasure${i}`];
      if (ingredient) {
        ingredients.push({
          name: ingredient,
          measure: measure ? measure.trim() : "",
        });
      }
    }
    return ingredients;
  };

  const parseMeasure = (measure) => {
    if (!measure) return null;
    const normalized = measure.trim();
    const fractionMatch = normalized.match(/^(\d+)\s+(\d+)\/(\d+)/);
    if (fractionMatch) {
      return (
        Number(fractionMatch[1]) +
        Number(fractionMatch[2]) / Number(fractionMatch[3])
      );
    }
    const mixedFractionMatch = normalized.match(/^(\d+)\/(\d+)/);
    if (mixedFractionMatch) {
      return Number(mixedFractionMatch[1]) / Number(mixedFractionMatch[2]);
    }
    const numberMatch = normalized.match(/[\d.]+/);
    return numberMatch ? Number(numberMatch[0]) : null;
  };

  const formatAmount = (amount) => {
    if (amount == null) return "";
    const rounded = Math.round(amount * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  };

  const scaledIngredients =
    selectedData && guestCount > 0
      ? getIngredients(selectedData).map((item) => ({
          ...item,
          scaledMeasure: parseMeasure(item.measure),
        }))
      : [];

  const hasKnownMeasurements = scaledIngredients.some(
    (item) => item.scaledMeasure != null,
  );

  const dilutionPerGuest =
    hasKnownMeasurements && guestCount > 0
      ? (scaledIngredients.reduce(
          (total, item) =>
            total + (item.scaledMeasure ? item.scaledMeasure : 0),
          0,
        ) *
          guestCount *
          0.2)
      : 0;

  const togglePartyDrink = () => {
    setPartyMenuMessage("");
    if (partyMenuIds.includes(params.id)) {
      updateDrinkIds(partyMenuIds.filter((id) => id !== params.id));
      return;
    }
    if (partyMenuIds.length >= 10) {
      setPartyMenuMessage("A cocktail menu can contain up to 10 drinks.");
      return;
    }
    updateDrinkIds([...partyMenuIds, params.id]);
  };

  return (
    <>
      <Navbar navigateToDrink />
      <main className={styles.pageContainer}>
        {selectedData ? (
          <>
            <div key={selectedData.idDrink} className={styles.drinkCard}>
              <div className={styles.imageWrapper}>
                <img
                  className={styles.drinkImage}
                  src={selectedData.strDrinkThumb}
                  alt={`${selectedData.strDrink} cocktail`}
                />
              </div>

              <div className={styles.drinkInfo}>
                {selectedData.strCategory && (
                  <span className={styles.drinkCategory}>
                    {selectedData.strCategory}
                  </span>
                )}
                <h2 className={styles.drinkName}>{selectedData.strDrink}</h2>

                <div className={styles.tagsRow}>
                  <span className={styles.tag}>{selectedData.strAlcoholic}</span>
                  <span className={styles.tag}>{selectedData.strGlass}</span>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Ingredients</h3>
                  <ul className={styles.ingredientsList}>
                    {getIngredients(selectedData).map((item, index) => (
                      <li key={index} className={styles.ingredientItem}>
                        <span className={styles.ingredientName}>{item.name}</span>
                        {item.measure && (
                          <span className={styles.ingredientMeasure}>
                            - {item.measure}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Instructions</h3>
                  <p className={styles.drinkRecipe}>
                    {selectedData.strInstructions}
                  </p>
                </div>

                <div className={styles.batchScaler}>
                  <h3 className={styles.sectionTitle}>Batch & Party Scaler</h3>
                  <label className={styles.guestControl}>
                    <span>Number of guests</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={guestCount}
                      onChange={(event) =>
                        setGuestCount(Math.max(1, Number(event.target.value) || 1))
                      }
                    />
                  </label>

                  <ul className={styles.scaledList}>
                    {scaledIngredients.map((item, index) => (
                      <li key={index}>
                        <span>{item.name}</span>
                        {item.scaledMeasure != null ? (
                          <strong>
                            {formatAmount(item.scaledMeasure * guestCount)} oz
                          </strong>
                        ) : (
                          <strong>{item.measure || "To taste"}</strong>
                        )}
                      </li>
                    ))}
                  </ul>

                  {dilutionPerGuest > 0 && (
                    <p className={styles.dilutionNote}>
                      Add approximately {formatAmount(dilutionPerGuest)} oz cold
                      water to replace shaking/stirring dilution.
                    </p>
                  )}
                </div>

                <div className={styles.partyActions}>
                  <button type="button" onClick={togglePartyDrink}>
                    {partyMenuIds.includes(params.id)
                      ? "Remove from Party Menu"
                      : "Add to Party Menu"}
                  </button>
                  {partyMenuIds.length > 0 && (
                    <Link
                      className={styles.partyMenuLink}
                      to={getPartyMenuPath(partyMenuIds)}
                    >
                      View {partyMenuIds.length}-Drink Cocktail Menu
                    </Link>
                  )}
                </div>
                {partyMenuMessage && (
                  <p className={styles.partyMenuMessage} role="status">
                    {partyMenuMessage}
                  </p>
                )}
              </div>
            </div>

            {suggestedDrinks.length > 0 && (
              <section className={styles.suggestions}>
                <div className={styles.suggestionsHeader}>
                  <span className={styles.suggestionsEyebrow}>Keep the night going</span>
                  <h3>You Might Also Like</h3>
                  <p>Handpicked cocktails with a similar style and spirit.</p>
                </div>
                <div className={styles.suggestionsGrid}>
                  {suggestedDrinks.map((drink) => (
                    <Link
                      key={drink.idDrink}
                      to={`/selectedDrink/${drink.idDrink}`}
                      className={styles.suggestionCard}
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                    >
                      <img
                        src={drink.strDrinkThumb}
                        alt={`${drink.strDrink} cocktail`}
                        className={styles.suggestionImage}
                      />
                      <div className={styles.suggestionInfo}>
                        <h4>{drink.strDrink}</h4>
                        <span>View recipe →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className={styles.loadingContainer}>
            <h2 className={styles.loadingText}>Loading mixology details ...</h2>
          </div>
        )}
      </main>
    </>
  );
};
