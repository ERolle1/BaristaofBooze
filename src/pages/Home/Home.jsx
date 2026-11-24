import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Homepage } from "../../containers/Homepage/Homepage";

import { Navbar } from "../../containers/Navbar/Navbar";
import { FeaturedDrink } from "../../containers/FeaturedDrink/FeaturedDrink";
import { useTastingPassport } from "../../hooks/useTastingPassport";

const skillBadges = [
  {
    name: "Negroni Family Explorer",
    qualifies: (record) =>
      ["negroni", "boulevardier", "americano", "white negroni"].includes(
        (record.name || "").toLowerCase(),
      ),
  },
  {
    name: "Tiki Apprentice",
    qualifies: (record) =>
      ["mai tai", "zombie", "planter's punch", "painkiller", "hurricane"].includes(
        (record.name || "").toLowerCase(),
      ),
  },
  {
    name: "Zero-Proof Mixologist",
    drinks: [],
    qualifies: (record) => record.alcoholic === "Non alcoholic",
  },
];

export const Home = () => {
  const location = useLocation();
  const { records } = useTastingPassport();
  const [getDrinks, setGetDrinks] = useState(
    location.state?.searchResults || [],
  );
  const [pantry, setPantry] = useState([]);
  const [customIngredient, setCustomIngredient] = useState("");
  const [pantryMatches, setPantryMatches] = useState([]);
  const [pantryReady, setPantryReady] = useState(false);

  const pantryOptions = [
    "Gin",
    "Vodka",
    "Rum",
    "Tequila",
    "Whiskey",
    "Lime Juice",
    "Lemon Juice",
    "Triple Sec",
    "Orange Juice",
    "Cranberry Juice",
  ];

  const togglePantryItem = (item) => {
    setPantry((current) =>
      current.includes(item)
        ? current.filter((ingredient) => ingredient !== item)
        : [...current, item],
    );
  };

  const addCustomIngredient = () => {
    const ingredient = customIngredient.trim();
    if (ingredient && !pantry.includes(ingredient)) {
      setPantry((current) => [...current, ingredient]);
      setCustomIngredient("");
    }
  };

  const findWhatICanMake = async () => {
    if (!pantry.length) return;

    const matchCounts = new Map();
    await Promise.all(
      pantry.map(async (ingredient) => {
        const res = await fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`,
        );
        const data = await res.json();
        (data.drinks || []).forEach((drink) => {
          matchCounts.set(drink.idDrink, {
            drink,
            count: (matchCounts.get(drink.idDrink)?.count || 0) + 1,
          });
        });
      }),
    );

    const matches = [...matchCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
      .map((match) => match.drink);

    setPantryMatches(matches);
    setPantryReady(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById("pantry-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  useEffect(() => {
    if (!location.state?.searchResults) return;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document
          .getElementById("search-results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }, [location.state]);

  return (
    <div>
      <Navbar setGetDrinks={setGetDrinks} scrollToResults />

      <FeaturedDrink />

      <section className="learningSection" aria-labelledby="study-title">
        <div>
          <p className="learningEyebrow">Practice makes the perfect pour</p>
          <h2 id="study-title">Build your bar skills</h2>
          <p>
            Drill classic specs, glassware, and garnishes with quick flashcards.
          </p>
        </div>
        <Link className="studyLink" to="/study">
          Start a study session
        </Link>
      </section>

      <section className="passportProgress" aria-labelledby="progress-title">
        <div className="passportHeading">
          <div>
            <p className="learningEyebrow">Your tasting passport</p>
            <h2 id="progress-title">Skill badges</h2>
          </div>
          <p>
            {Object.values(records).filter((record) => record.made).length}{" "}
            drinks made
          </p>
        </div>
        <div className="badgeGrid">
          {skillBadges.map((badge) => {
            const count = Object.values(records).filter(
              (record) => record.made && badge.qualifies(record),
            ).length;
            const earned = count >= 2;
            return (
              <article
                key={badge.name}
                className={`skillBadge ${earned ? "skillBadgeEarned" : ""}`}
              >
                <span aria-hidden="true">{earned ? "✦" : "○"}</span>
                <div>
                  <h3>{badge.name}</h3>
                  <p>{earned ? "Badge earned" : `${count} / 2 drinks made`}</p>
                </div>
              </article>
            );
          })}
        </div>
        <p className="passportPrivacy">Your ratings and notes stay in this browser.</p>
      </section>

      <section className="pantrySection">
        <div className="pantryHeader">
          <h3>What Can I Make?</h3>
          <p>Check the bottles, mixers, and garnishes you have at home.</p>
        </div>

        <div className="pantryGrid">
          {pantryOptions.map((item) => (
            <label key={item} className="pantryOption">
              <input
                type="checkbox"
                checked={pantry.includes(item)}
                onChange={() => togglePantryItem(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>

        <div className="customPantry">
          <input
            type="text"
            value={customIngredient}
            onChange={(event) => setCustomIngredient(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addCustomIngredient();
            }}
            placeholder="Add another ingredient"
          />
          <button type="button" onClick={addCustomIngredient}>
            Add
          </button>
          <button type="button" onClick={findWhatICanMake}>
            Find Drinks
          </button>
        </div>

        {pantry.length > 0 && (
          <div className="selectedPantry">
            {pantry.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => togglePantryItem(item)}
                aria-label={`Remove ${item}`}
              >
                {item} ×
              </button>
            ))}
          </div>
        )}

        {pantryReady && (
          <div id="pantry-results" className="pantryResults">
            <h4>
              {pantryMatches.length
                ? "Ready to Mix"
                : "No exact matches found"}
            </h4>
            {pantryMatches.map((drink) => (
              <Link
                key={drink.idDrink}
                to={`/selectedDrink/${drink.idDrink}`}
                className="pantryMatch"
              >
                <img src={drink.strDrinkThumb} alt={drink.strDrink} />
                <span>{drink.strDrink}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Homepage getDrinks={getDrinks} />
    </div>
  );
};
