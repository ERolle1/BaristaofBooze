import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import styles from "../SelectedDrink/selecteddrink.module.css";

export const SelectedDrink = () => {
  //  GET ID FROM PARAM
  const params = useParams();

  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    async function fetchSelected() {
      const response = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${params.id}`,
      );
      const data = await response.json();

      const info = data.drinks[0];
      setSelectedData(info);
    }

    fetchSelected();
  }, [params.id]);
  // console.log(params);
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

  return (
    <div className={styles.pageContainer}>
      {selectedData ? (
        <div key={selectedData.idDrink} className={styles.drinkCard}>
          <div className={styles.imageWrapper}>
            <img
              className={styles.drinkImage}
              src={selectedData.strDrinkThumb}
              alt=""
            />
          </div>

          {console.log(selectedData.idDrink)}

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
          </div>
        </div>
      ) : (
        <div className={styles.loadingContainer}>
          <h2 className={styles.loadingText}>Loading mixology details ...</h2>
        </div>
      )}
    </div>
  );
};
