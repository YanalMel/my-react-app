import React, { useState, useEffect } from "react";

const LocationPriceDisplay = ({ location, itemData, enchantmentLevel }) => {
  const [recipes, setRecipes] = useState([]);

  // Extract base recipes
  useEffect(() => {
    console.log("ItemData passed to component:", itemData);
    console.log("Enchantment Level passed to component:", enchantmentLevel);

    if (itemData && itemData.craftresource) {
      console.log("ItemData and craftresource exist.");

      // Only extract the 'Base' recipe and ignore the enchantment levels
      const baseRecipe = itemData.craftresource.find(
        (recipe) => recipe.type === "Base"
      );

      if (baseRecipe && baseRecipe.craftresource) {
        console.log("Base recipe found:", baseRecipe);
        console.log(
          "Craft resources in base recipe:",
          baseRecipe.craftresource
        );
        setRecipes(baseRecipe.craftresource);
      } else {
        console.log("No valid base recipe found.");
        setRecipes([]); // If no valid recipe is found, clear the recipes
      }
    } else {
      console.log("ItemData or craftresource is missing.");
      setRecipes([]); // If itemData or craftresource is missing, clear the recipes
    }
  }, [itemData]);

  // Function to calculate total cost for each resource
  const calculateTotalCost = (resources) => {
    return resources.reduce((total, resource) => {
      const resourcePrice = 192; // Placeholder price for now
      return total + resource.count * resourcePrice;
    }, 0);
  };

  // Helper function to generate the proper resource name based on enchantment level
  const generateResourceName = (uniquename, enchantmentLevel) => {
    if (enchantmentLevel === 0) {
      return uniquename;
    }
    return `${uniquename}_LEVEL${enchantmentLevel}@${enchantmentLevel}`;
  };

  return (
    <div className="location-price-display">
      <h3>Location: {location}</h3>
      <p>Recipe Type: Base</p>

      {/* Check if we have recipes before attempting to render them */}
      {recipes.length > 0 ? (
        <div>
          {recipes.map((material, index) => {
            // Generate the proper resource name with _LEVELX@X format
            const properResourceName = generateResourceName(
              material.uniquename,
              enchantmentLevel
            );
            // Construct the image URL
            const imageUrl = `https://render.albiononline.com/v1/item/${properResourceName}.png`;

            console.log(
              `Current material being processed: ${properResourceName} (x${material.count})`
            );
            console.log("Image URL being rendered:", imageUrl);

            return (
              <div
                key={index}
                className="craft-material"
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <img
                  src={imageUrl}
                  alt={material.uniquename}
                  className="material-image"
                  style={{
                    width: "50px",
                    height: "50px",
                    marginRight: "10px",
                  }}
                />
                <p>
                  {properResourceName} (x{material.count})
                </p>
                <p>Total: {material.count * 192}.00</p>
              </div>
            );
          })}
          <div className="total-craft-cost">
            <p>Total Craft Cost for Recipe: {calculateTotalCost(recipes)}</p>
          </div>
        </div>
      ) : (
        <p>No materials found for this recipe.</p>
      )}

      {/* Input for item price */}
      <div className="item-price-input">
        <label>Item Price for {location}:</label>
        <input type="number" defaultValue={0} />
      </div>

      {/* Potential Profit Calculation */}
      <div className="potential-profit">
        <p>Potential Profit: -1484.00</p> {/* Example calculation */}
      </div>
    </div>
  );
};

export default LocationPriceDisplay;
