import { useEffect, useState } from "react";
import styles from "../FeaturedDrink/featuredDrink.module.css";

const URL = "https://www.thecocktaildb.com/api/json/v1/1/random.php";

export const FeaturedDrink = () => {
  const [randomDrink, setRandomDrink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function fetchRandom() {
      try {
        const res = await fetch(URL);
        if (!res.ok) {
          throw new Error(`Cocktail request failed with status ${res.status}`);
        }

        const data = await res.json();
        if (!data.drinks?.[0]) {
          throw new Error("Cocktail request returned no drinks");
        }

        setRandomDrink(data.drinks[0]);
      } catch (requestError) {
        console.error("Could not load the cocktail highlight.", requestError);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRandom();
  }, []);

  const getIngredients = (drink) => {
    const ingredients = [];

    if (!drink) return ingredients;

    for (let i = 1; i <= 15; i++) {
      const ingredient = drink[`strIngredient${i}`];

      if (ingredient && ingredient.trim() !== "") {
        const measure = drink[`strMeasure${i}`];

        ingredients.push({
          id: i,
          text: measure
            ? `${measure.trim()} ${ingredient.trim()}`
            : ingredient.trim(),
        });
      }
    }
    return ingredients;
  };
  const ingredientsList = getIngredients(randomDrink);
  return (
    <div className={styles.featuredContainer}>
      <h3 className={styles.randomHeader}>Cocktail Highlight</h3>
      <div className={styles.randomContainer}>
        {randomDrink?.strDrinkThumb && !imageError ? (
          <img
            className={styles.randomImage}
            src={randomDrink.strDrinkThumb}
            alt={`${randomDrink.strDrink} cocktail`}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.imagePlaceholder} role="status">
            {loading
              ? "Loading cocktail photo..."
              : error || imageError
                ? "Cocktail photo unavailable"
                : ""}
          </div>
        )}
        <div className={styles.randomInfoContainer} aria-live="polite">
          {loading && <p>Loading cocktail highlight...</p>}
          {error && <p>Cocktail highlight is temporarily unavailable.</p>}
          {randomDrink && (
            <>
              <div className={styles.badgeRow}>
                {randomDrink.strCategory && (
                  <span className={styles.tagBadge}>
                    {randomDrink.strCategory}
                  </span>
                )}
                {randomDrink.strGlass && (
                  <span className={styles.tagBadge}>{randomDrink.strGlass}</span>
                )}
              </div>

              <h4 className={styles.featuredDrinkName}>
                {randomDrink.strDrink}
              </h4>

              <ul className={styles.ingredientsList}>
                {ingredientsList.map((item) => (
                  <li key={item.id} className={styles.ingredientItem}>
                    • {item.text}
                  </li>
                ))}
              </ul>

              <div className={styles.goldDivider}></div>
              <p className={styles.featuredDrinkRecipe}>
                {randomDrink.strInstructions}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
