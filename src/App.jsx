import { useState } from "react";

import "./App.css";
import { Homepage } from "./containers/Homepage/Homepage";

import { Navbar } from "./containers/Navbar/Navbar";
import { FeaturedDrink } from "./containers/FeaturedDrink/FeaturedDrink";

function App() {
  const [getDrinks, setGetDrinks] = useState([]);
  return (
    <>
      <Navbar setGetDrinks={setGetDrinks} />

      <FeaturedDrink />

      <Homepage getDrinks={getDrinks} setGetDrinks={setGetDrinks} />
    </>
  );
}

export default App;
