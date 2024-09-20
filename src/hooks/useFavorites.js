import { useState, useEffect } from "react";

export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    // Get favorites from localStorage on initial load
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    // Save favorites to localStorage whenever it changes
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (uniqueName) => {
    const baseUniqueName = uniqueName.split("@")[0]; // Strip the enchantment suffix

    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(baseUniqueName)) {
        // Return a new array without the baseUniqueName
        return prevFavorites.filter((fav) => fav !== baseUniqueName);
      } else {
        // Add the baseUniqueName to the array
        return [...prevFavorites, baseUniqueName];
      }
    });
  };

  return { favorites, toggleFavorite };
}
