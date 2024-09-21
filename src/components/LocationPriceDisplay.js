import React, { useState, useEffect } from "react";

// Move processCraftResource outside of the component
const processCraftResource = (craftresourceArray, enchantmentLevel) => {
  let materials = [];

  craftresourceArray.forEach((material) => {
    if (material.craftresource) {
      // Recursively process nested craft resources
      materials = materials.concat(
        processCraftResource(material.craftresource, enchantmentLevel)
      );
    } else {
      // If it's a valid material, process it
      if (material && material.uniquename && material.count) {
        materials.push(material);
      }
    }
  });

  return materials;
};

const LocationPriceDisplay = ({ location, itemData, enchantmentLevel }) => {
  const [recipes, setRecipes] = useState([]);

  // Helper function to add enchantment level to resource names, excluding artifacts
  const appendEnchantment = (uniquename, enchantmentLevel) => {
    const isArtifact = uniquename.includes("ARTEFACT");
    if (enchantmentLevel > 0 && !isArtifact) {
      return `${uniquename}_LEVEL${enchantmentLevel}@${enchantmentLevel}`;
    }
    return uniquename;
  };

  // Extract base recipes
  useEffect(() => {
    console.log("ItemData passed to component:", itemData);

    if (itemData && itemData.craftresource) {
      console.log("ItemData and craftresource exist.");

      // Extract all 'Base' recipes and ignore the enchantment levels
      const baseRecipes = itemData.craftresource.filter(
        (recipe) => recipe.type === "Base"
      );

      if (baseRecipes.length > 0) {
        console.log("Base recipes found:", baseRecipes);
        const processedRecipes = baseRecipes.map((recipe) =>
          processCraftResource(recipe.craftresource, enchantmentLevel)
        );
        setRecipes(processedRecipes);
      } else {
        console.log("No valid base recipe found.");
        setRecipes([]); // If no valid recipe is found, clear the recipes
      }
    } else {
      console.log("ItemData or craftresource is missing.");
      setRecipes([]); // If itemData or craftresource is missing, clear the recipes
    }
  }, [itemData, enchantmentLevel]);

  const calculateTotalCost = (resources) => {
    return resources.reduce((total, resource) => {
      // Assuming dynamic pricing, you can replace '192' with actual prices per resource from another source if needed
      const resourcePrice = 192; // Example price for now
      return total + resource.count * resourcePrice;
    }, 0);
  };

  return (
    <div className="location-price-display">
      <h3>Location: {location}</h3>
      <p>
        Recipe Type:{" "}
        {enchantmentLevel > 0
          ? `Enchantment Level ${enchantmentLevel}`
          : "Base"}
      </p>

      {/* Check if we have recipes before attempting to render them */}
      {recipes.length > 0 ? (
        recipes.map((recipe, recipeIndex) => (
          <div key={recipeIndex} className="recipe-item">
            <h4>Recipe {recipeIndex + 1}</h4>
            <div className="materials-list">
              {recipe && recipe.length > 0 ? (
                recipe.map((material, materialIndex) => {
                  // Validate that material has the required properties
                  if (!material || !material.uniquename || !material.count) {
                    console.log(
                      `Invalid material at index ${materialIndex} in recipe ${recipeIndex}`
                    );
                    return null;
                  }

                  // Construct the image URL
                  const imageUrl = `https://render.albiononline.com/v1/item/${appendEnchantment(
                    material.uniquename,
                    enchantmentLevel
                  )}.png`;

                  console.log(
                    `Current material being processed: ${material.uniquename} (x${material.count})`
                  );
                  console.log("Image URL being rendered:", imageUrl);

                  return (
                    <div
                      key={material.uniquename}
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
                      <div>
                        <p>
                          {material.uniquename} (x{material.count})
                        </p>
                        <p>
                          Total: {material.count * 192}.00 {/* Example price */}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No materials found for this recipe.</p>
              )}
            </div>
            <div className="total-craft-cost">
              <p>
                Total Craft Cost for Recipe: {calculateTotalCost(recipe || [])}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p>No recipes available for this item.</p>
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
