import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router";
import { Home } from "./pages/Home/Home";
import { SelectedDrink } from "./pages/SelectedDrink/SelectedDrink";
import { PartyMenu } from "./pages/PartyMenu/PartyMenu";
import { Study } from "./pages/Study/Study";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/selectedDrink" element={<SelectedDrink />} /> */}
        <Route path="/selectedDrink/:id" element={<SelectedDrink />} />
        <Route path="/party-menu" element={<PartyMenu />} />
        <Route path="/party-menu/:ids" element={<PartyMenu />} />
        <Route path="/study" element={<Study />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
