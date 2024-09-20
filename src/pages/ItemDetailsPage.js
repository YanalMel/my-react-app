import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import ItemDetails from "../components/ItemDetails";

export default function ItemDetailsPage() {
  const { uniqueName } = useParams();
  const [item, setItem] = useState(null);

  // Memoize `fetchItemDetails` using `useCallback`
  const fetchItemDetails = useCallback(async () => {
    try {
      const itemsText = await fetch("/items.txt").then((res) => res.text());
      const outputJson = await fetch("/Output.json").then((res) => res.json());

      const displayNames = {};
      const lines = itemsText.split("\n");
      lines.forEach((line) => {
        const parts = line.split(":");
        if (parts.length >= 3) {
          const unique = parts[1].trim();
          const displayName = parts[2].trim();
          displayNames[unique] = displayName;
        }
      });

      const item = outputJson.equipmentitem
        .concat(outputJson.weapon)
        .find((i) => i.uniquename === uniqueName);
      if (item) {
        setItem({
          ...item,
          displayName: displayNames[item.uniquename] || item.uniquename,
        });
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  }, [uniqueName]); // Include `uniqueName` as a dependency of the function

  useEffect(() => {
    fetchItemDetails();
  }, [fetchItemDetails]); // Include `fetchItemDetails` in the dependency array

  return <div>{item ? <ItemDetails item={item} /> : <p>Loading...</p>}</div>;
}
