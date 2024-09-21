import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LocationPriceDisplay from "../components/LocationPriceDisplay"; // Import new component

const ItemDetailsPage = () => {
  const { uniqueName } = useParams(); // Get the itemId from the URL
  const [itemData, setItemData] = useState(null);
  const [enchantmentLevel, setEnchantmentLevel] = useState(0);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [prices, setPrices] = useState({}); // Store prices for each location
  const navigate = useNavigate();

  // Fetch item data and handle enchantment
  useEffect(() => {
    const [itemBaseId, enchant] = uniqueName.split("@");
    const enchantment = parseInt(enchant) || 0;
    setEnchantmentLevel(enchantment);

    const fetchItemData = async () => {
      try {
        const response = await fetch("/Output.json");
        const data = await response.json();
        const item =
          data.equipmentitem.find((itm) => itm.uniquename === itemBaseId) ||
          data.weapon.find((itm) => itm.uniquename === itemBaseId);

        if (item) {
          setItemData(item);
        } else {
          console.error("Item not found in Output.json");
        }
      } catch (error) {
        console.error("Error fetching Output.json:", error);
      }
    };

    fetchItemData();
  }, [uniqueName]);

  const locations = [
    "Thetford",
    "Fort Sterling",
    "Lymhurst",
    "Bridgewatch",
    "Martlock",
    "Caerleon",
    "Brecilien",
  ];

  const handleLocationChange = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((loc) => loc !== location)
        : [...prev, location]
    );
  };

  const handleFetchPrices = () => {
    const mockPrices = selectedLocations.reduce((acc, location) => {
      acc[location] = `$${Math.floor(Math.random() * 1000)}`;
      return acc;
    }, {});

    setPrices(mockPrices);
  };

  const handleEnchantmentChange = (level) => {
    setEnchantmentLevel(parseInt(level));
    const newUrl = `/item/${uniqueName.split("@")[0]}@${level}`;
    navigate(newUrl);
  };

  if (!itemData) {
    return <div>Loading item data...</div>;
  }

  return (
    <div className="item-details-container">
      <div className="item-details-box">
        <div className="item-details-left">
          <img
            src={`https://render.albiononline.com/v1/item/${
              itemData.uniquename
            }${enchantmentLevel ? `@${enchantmentLevel}` : ""}.png`}
            alt={itemData.displayName}
            className="item-image"
          />
        </div>
        <div className="item-details-right">
          <h1 className="item-name">{itemData.displayName}</h1>
          <p>
            <strong>Tier:</strong> {itemData.tier}
          </p>
          <p>
            <strong>Category:</strong> {itemData.shopcategory || "Unknown"}
          </p>
          <p>
            <strong>Subcategory:</strong>{" "}
            {itemData.shopsubcategory1 || "Unknown"}
          </p>

          <p>
            <strong>Enchantment Level:</strong>
            <select
              value={enchantmentLevel}
              onChange={(e) => handleEnchantmentChange(e.target.value)}
              className="enchantment-select"
            >
              {[0, 1, 2, 3].map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </p>

          <h3>Select Location(s):</h3>
          <div className="locations">
            {locations.map((location) => (
              <label key={location}>
                <input
                  type="checkbox"
                  value={location}
                  checked={selectedLocations.includes(location)}
                  onChange={() => handleLocationChange(location)}
                />
                {location}
              </label>
            ))}
          </div>

          <button className="fetch-prices-btn" onClick={handleFetchPrices}>
            Fetch Prices
          </button>
        </div>
      </div>

      {/* Location Price Display Section Below */}
      <div className="location-prices-section">
        {selectedLocations.length > 0 &&
          selectedLocations.map((location) => (
            <LocationPriceDisplay
              key={location}
              location={location}
              priceData={prices[location]}
            />
          ))}
      </div>
    </div>
  );
};

export default ItemDetailsPage;
