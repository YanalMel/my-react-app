import React from "react";

export default function ItemDetails({ item }) {
  if (!item) {
    return <p>Item not found!</p>;
  }

  return (
    <div className="item-details">
      <img
        src={`https://render.albiononline.com/v1/item/${item.uniquename}.png`}
        alt={item.displayName}
        className="item-image"
      />
      <h1>{item.displayName}</h1>
      <p>
        <strong>Tier:</strong> {item.tier}
      </p>
      <p>
        <strong>Category:</strong> {item.shopcategory}
      </p>
      {item.shopsubcategory1 && (
        <p>
          <strong>Subcategory:</strong> {item.shopsubcategory1}
        </p>
      )}
      {item.enchantment && (
        <p>
          <strong>Enchantment Level:</strong> {item.enchantment}
        </p>
      )}
    </div>
  );
}
