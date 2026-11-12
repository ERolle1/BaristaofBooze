import styles from "../Homepage/homepage.module.css";

export const Homepage = ({ getDrinks, setGetDrinks }) => {
  return (
    <>
      {getDrinks && getDrinks.length > 0 && (
        <div className={styles.searchResults}>
          <div className={styles.sectionDivider}>
            <span className={styles.dividerLine}></span>
            <h3 className={styles.resultsTitle}>Search Results</h3>
            <span className={styles.dividerLine}></span>
          </div>

          <div className={styles.drinkContainer}>
            {getDrinks.map((drink) => {
              return (
                <div key={drink.idDrink} className={styles.drinkCard}>
                  <img
                    className={styles.drinkImage}
                    src={drink.strDrinkThumb}
                    alt=""
                  />
                  <div className={styles.drinkInfo}>
                    {drink.strCategory && (
                      <span className={styles.drinkCategory}>
                        {drink.strCategory}
                      </span>
                    )}
                    <h4 className={styles.drinkName}>{drink.strDrink}</h4>
                    <p className={styles.drinkRecipe}>
                      {drink.strInstructions}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
