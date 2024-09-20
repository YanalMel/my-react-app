import React from "react";

export default function ItemList({
  items,
  onItemSelect,
  toggleFavorite,
  favorites,
}) {
  if (!items || items.length === 0) {
    return <div>No items to display</div>;
  }

  return (
    <div className="item-container">
      {items.map((item) => {
        // Strip the enchantment suffix from the item's uniquename for comparison
        const baseUniqueName = item.uniquename.split("@")[0];
        const isFavorite = favorites.includes(baseUniqueName);

        return (
          <div key={item.uniquename} className="item">
            <img
              src={item.image}
              alt={item.displayName}
              onClick={() => onItemSelect(item)}
            />
            <h3>{item.displayName}</h3>
            <p>Tier: {item.displayTier}</p>
            <button
              className="favorite-button"
              onClick={() => toggleFavorite(item.uniquename)} // Toggle using the full uniquename
            >
              {isFavorite ? <span>❤️ Favorite</span> : <span>🤍 Favorite</span>}
            </button>
          </div>
        );
      })}
    </div>
  );
}
