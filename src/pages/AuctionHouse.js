import React, { useState, useEffect } from "react";
import Filters from "../components/Filters";
import ItemList from "../components/ItemList";
import Pagination from "../components/Pagination";
import useFavorites from "../hooks/useFavorites";

export default function AuctionHouse() {
  const [items, setItems] = useState([]); // All items
  const [filteredItems, setFilteredItems] = useState([]); // Filtered items
  const [categories, setCategories] = useState({}); // Store categories and subcategories
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { favorites, toggleFavorite } = useFavorites();
  const [showFavorites, setShowFavorites] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchItems(); // Fetch items once when the component mounts
  }, []);

  const fetchItems = async () => {
    try {
      const itemsText = await fetch("/items.txt").then((res) => res.text());
      const outputJson = await fetch("/Output.json").then((res) => res.json());

      const displayNames = {};
      const lines = itemsText.split("\n");
      lines.forEach((line) => {
        const parts = line.split(":");
        if (parts.length >= 3) {
          const uniqueName = parts[1].trim();
          const displayName = parts[2].trim();
          displayNames[uniqueName] = displayName;
        }
      });

      const itemsData = outputJson.equipmentitem.concat(outputJson.weapon);
      const enrichedItems = itemsData.map((item) => ({
        ...item,
        displayName: displayNames[item.uniquename] || item.uniquename,
        displayTier: `${item.tier}.0`,
      }));

      // Dynamically extract categories and subcategories
      const extractedCategories = {};
      enrichedItems.forEach((item) => {
        if (!extractedCategories[item.shopcategory]) {
          extractedCategories[item.shopcategory] = new Set();
        }
        if (item.shopsubcategory1) {
          extractedCategories[item.shopcategory].add(item.shopsubcategory1);
        }
      });

      setItems(enrichedItems);
      setFilteredItems(enrichedItems); // Initialize filtered items
      setCategories(extractedCategories); // Set the categories dynamically
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const applyFilters = (newFilters) => {
    let filtered = items;

    // Apply search filter
    if (newFilters.search) {
      filtered = filtered.filter((item) =>
        item.displayName.toLowerCase().includes(newFilters.search.toLowerCase())
      );
    }

    // Apply category filter
    if (newFilters.category !== "All") {
      filtered = filtered.filter(
        (item) => item.shopcategory === newFilters.category
      );
    }

    // Apply subcategory filter
    if (newFilters.subcategory !== "All") {
      filtered = filtered.filter(
        (item) => item.shopsubcategory1 === newFilters.subcategory
      );
    }

    // Apply tier filter
    if (newFilters.tier !== "All") {
      filtered = filtered.filter((item) => item.tier === newFilters.tier);
    }

    // Apply enchantment filter
    if (newFilters.enchantment !== "All") {
      const enchantmentSuffix = `@${newFilters.enchantment}`;
      filtered = filtered.map((item) => ({
        ...item,
        uniquename: `${item.uniquename}${enchantmentSuffix}`,
        image: `${item.image.replace(".png", "")}${enchantmentSuffix}.png`,
        displayTier: `${item.tier}.${newFilters.enchantment}`,
      }));
    } else {
      // Reset displayTier if no enchantment is applied
      filtered = filtered.map((item) => ({
        ...item,
        displayTier: `${item.tier}.0`,
      }));
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to the first page
    setRefreshKey((prevKey) => prevKey + 1); // Force item list refresh
  };

  const handleClearFilters = () => {
    // Reset filters and items
    setFilteredItems(items);
    setCurrentPage(1); // Reset pagination to the first page
    setRefreshKey((prevKey) => prevKey + 1); // Force refresh
  };

  const handleItemClick = (item) => {
    // Use React Router navigation (if applicable) instead of a full page reload
    window.location.href = `/item/${item.uniquename}`;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowFavorites = () => {
    if (showFavorites) {
      setFilteredItems(items); // Show all items when favorites are hidden
    } else {
      setFilteredItems(
        items.filter((item) => favorites.includes(item.uniquename))
      );
    }
    setShowFavorites(!showFavorites); // Toggle favorite view
    setCurrentPage(1); // Reset to the first page after toggling favorites
    setRefreshKey((prevKey) => prevKey + 1); // Force refresh
  };

  return (
    <div>
      <Filters
        onApplyFilters={applyFilters}
        onClear={handleClearFilters}
        onShowFavorites={handleShowFavorites}
        categories={categories} // Pass categories to Filters dynamically
      />
      <h2>
        Showing{" "}
        {
          filteredItems.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          ).length
        }{" "}
        out of {filteredItems.length} results
      </h2>
      <ItemList
        key={refreshKey}
        items={filteredItems.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        )}
        onItemSelect={handleItemClick}
        toggleFavorite={toggleFavorite}
        favorites={favorites}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredItems.length / itemsPerPage)}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
