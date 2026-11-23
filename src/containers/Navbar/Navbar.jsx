import { useState } from "react";
import { Link, useNavigate } from "react-router";
import styles from "../Navbar/navbar.module.css";
import {
  getPartyMenuPath,
  usePartyMenu,
} from "../../hooks/usePartyMenu";

export const Navbar = ({
  setGetDrinks,
  scrollToResults = false,
  navigateToDrink = false,
}) => {
  const navigate = useNavigate();
  const { drinkIds: partyMenuIds } = usePartyMenu();
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const handleSearch = async () => {
    const query = searchInput.trim();
    if (!query || isSearching) return;

    setIsSearching(true);
    setSearchMessage("");
    try {
      const res = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
      );
      if (!res.ok) {
        throw new Error(`Cocktail search failed with status ${res.status}`);
      }

      const data = await res.json();
      const drinks = data.drinks || [];

      if (navigateToDrink) {
        const firstMatch = drinks[0];
        if (!firstMatch) {
          setSearchMessage(`No drinks found for "${query}".`);
          return;
        }

        navigate(`/selectedDrink/${firstMatch.idDrink}`);
        return;
      }

      if (setGetDrinks) {
        setGetDrinks(drinks);
      }

      if (!drinks.length) {
        setSearchMessage(`No drinks found for "${query}".`);
      }

      if (scrollToResults) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            document
              .getElementById("search-results")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        });
      }
    } catch (error) {
      console.error("Could not search for drinks.", error);
      setSearchMessage("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logoLink}>
        <h1 className={styles.navbar_logo}> 🍸Barista of Booze</h1>
      </Link>
      <h2 className={styles.headerOpening}>
        Elevate Your <span className={styles.highlight}>At-Home</span> Bar
        Experience
      </h2>
      <p className={styles.subtitle}>Discover precision mixology recipes. </p>

      <div className={styles.searchContainer}>
        <input
          type="text"
          name=""
          id=""
          placeholder="Search for a drink you're interested in"
          className={styles.searchInput}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSearch();
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          className={styles.searchBtn}
          disabled={isSearching}
        >
          {isSearching ? "SEARCHING..." : "SEARCH"}
        </button>
      </div>
      {searchMessage && (
        <p className={styles.searchMessage} role="status">
          {searchMessage}
        </p>
      )}
      {partyMenuIds.length > 0 && (
        <Link
          className={styles.partyMenuLink}
          to={getPartyMenuPath(partyMenuIds)}
        >
          View your cocktail menu ({partyMenuIds.length})
        </Link>
      )}
    </nav>
  );
};
