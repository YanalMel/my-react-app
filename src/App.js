import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuctionHouse from "./pages/AuctionHouse";
import ItemDetailsPage from "./pages/ItemDetailsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuctionHouse />} />
        <Route path="/item/:uniqueName" element={<ItemDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
