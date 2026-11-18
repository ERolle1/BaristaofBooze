import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router";
import { Home } from "./pages/Home/Home";
import { SelectedDrink } from "./pages/SelectedDrink/SelectedDrink";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/selectedDrink" element={<SelectedDrink />} /> */}
        <Route path="/selectedDrink/:id" element={<SelectedDrink />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
