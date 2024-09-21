// src/components/LocationPriceDisplay.js
import React from "react";

const LocationPriceDisplay = ({ location, priceData }) => {
  return (
    <div className="location-price-display">
      <h3>Location: {location}</h3>
      {priceData ? (
        <p>Price: {priceData}</p> // Assume priceData is coming from the API or hardcoded for now
      ) : (
        <p>Fetching prices...</p>
      )}
    </div>
  );
};

export default LocationPriceDisplay;
