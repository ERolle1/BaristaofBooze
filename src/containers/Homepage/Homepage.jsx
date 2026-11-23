import { Link } from "react-router";
import styles from "../Homepage/homepage.module.css";

export const Homepage = ({ getDrinks }) => {
  return (
    <>
      {getDrinks && getDrinks.length > 0 && (
        <div id="search-results" className={styles.searchResults}>
          <div className={styles.sectionDivider}>
            <span className={styles.dividerLine}></span>
            <h3 className={styles.resultsTitle}>Search Results</h3>
            <span className={styles.dividerLine}></span>
          </div>

          <div className={styles.drinkContainer}>
            {getDrinks.map((drink) => {
              return (
                <Link
                  key={drink.idDrink}
                  to={`/selectedDrink/${drink.idDrink}`}
                  className={styles.drinkCardLink}
                >
                  <article className={styles.drinkCard}>
                    <div className={styles.imageWrapper}>
                      <img
                        className={styles.drinkImage}
                        src={drink.strDrinkThumb}
                        alt={`${drink.strDrink} cocktail`}
                      />
                      {drink.strCategory && (
                        <span className={styles.drinkCategory}>
                          {drink.strCategory}
                        </span>
                      )}
                    </div>
                    <div className={styles.drinkInfo}>
                      <h4 className={styles.drinkName}>{drink.strDrink}</h4>
                      {drink.strGlass && (
                        <p className={styles.drinkGlass}>
                          Served in: {drink.strGlass}
                        </p>
                      )}
                      <span className={styles.viewRecipe}>View recipe →</span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
