import { useEffect, useState } from "react";
import styles from "../FeaturedDrink/featuredDrink.module.css";

const URL = "https://www.thecocktaildb.com/api/json/v1/1/random.php";

export const FeaturedDrink = () => {
  const [randomDrink, setRandomDrink] = useState("");

  useEffect(() => {
    async function fetchRandom() {
      const res = await fetch(URL);
      const data = await res.json();
      console.log(data.drinks);
      setRandomDrink(data.drinks[0]);
    }
    fetchRandom();
  }, []);

  const getIngredients = (drink) => {
    const ingredients = [];

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
        <img
          className={styles.randomImage}
          src={randomDrink.strDrinkThumb}
          alt=""
        />
        <div className={styles.randomInfoContainer}>
          <div className={styles.badgeRow}>
            {randomDrink.strCategory && (
              <span className={styles.tagBadge}>{randomDrink.strCategory}</span>
            )}
            {randomDrink.strGlass && (
              <span className={styles.tagBadge}>{randomDrink.strGlass}</span>
            )}
          </div>

          <h4 className={styles.featuredDrinkName}>{randomDrink.strDrink}</h4>

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
        </div>
      </div>
    </div>
  );
};
