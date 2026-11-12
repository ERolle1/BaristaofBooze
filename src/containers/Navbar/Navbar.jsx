import { useEffect, useState } from "react";
import styles from "../Navbar/navbar.module.css";

export const Navbar = ({ setGetDrinks }) => {
  const [searchInput, setSearchInput] = useState("daiquiri");

  const URL = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchInput}`;

  const handleSearch = () => {
    async function fetchDetails() {
      const res = await fetch(URL);
      const data = await res.json();
      setGetDrinks(data.drinks);
    }
    fetchDetails();
  };
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.navbar_logo}> 🍸Barista of Booze</h1>
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
          placeholder="Search Drink"
          className={styles.searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button onClick={handleSearch} className={styles.searchBtn}>
          SEARCH
        </button>
      </div>
    </nav>
  );
};
