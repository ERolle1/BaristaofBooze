import { useState } from "react";
import { Homepage } from "../../containers/Homepage/Homepage";

import { Navbar } from "../../containers/Navbar/Navbar";
import { FeaturedDrink } from "../../containers/FeaturedDrink/FeaturedDrink";

export const Home = () => {
  const [getDrinks, setGetDrinks] = useState([]);

  return (
    <div>
      <Navbar setGetDrinks={setGetDrinks} />

      <FeaturedDrink />

      <Homepage getDrinks={getDrinks} setGetDrinks={setGetDrinks} />
    </div>
  );
};
