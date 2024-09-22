import React, { useState, useEffect } from "react";

// Recursive function to handle nested craftresource arrays safely
const processCraftResource = (craftresourceArray) => {
  let materials = [];

  // Safely check if the craftresourceArray exists and is an array
  if (Array.isArray(craftresourceArray)) {
    craftresourceArray.forEach((material) => {
      if (material.craftresource) {
        // Recursively process nested craft resources
        materials = materials.concat(
          processCraftResource(material.craftresource)
        );
      } else {
        // If it's a valid material, process it
        if (material && material.uniquename && material.count) {
          materials.push(material);
        }
      }
    });
  }

  return materials;
};

const LocationPriceDisplay = ({ location, itemData, enchantmentLevel }) => {
  const [recipes, setRecipes] = useState([]);
  const [itemPrices, setItemPrices] = useState({});
  const [potentialProfits, setPotentialProfits] = useState({});

  // Helper function to add enchantment level to resource names, excluding artifacts
  const appendEnchantment = (uniquename, enchantmentLevel) => {
    const isArtifact = uniquename.includes("ARTEFACT");
    if (enchantmentLevel > 0 && !isArtifact) {
      return `${uniquename}_LEVEL${enchantmentLevel}@${enchantmentLevel}`;
    }
    return uniquename;
  };

  // Extract base recipes and split nested arrays
  useEffect(() => {
    if (itemData && Array.isArray(itemData.craftresource)) {
      // Safely map over top-level craftresource arrays and their nested resources
      const processedRecipes = itemData.craftresource.map((resourceGroup) => {
        // Ensure that resourceGroup.craftresource exists and is an array
        if (Array.isArray(resourceGroup.craftresource)) {
          return {
            type: resourceGroup.type,
            materials: processCraftResource(resourceGroup.craftresource),
          };
        } else {
          return null;
        }
      });

      // Filter out invalid entries and set recipes
      setRecipes(processedRecipes.filter(Boolean));
    } else {
      setRecipes([]); // If itemData or craftresource is missing, clear the recipes
    }
  }, [itemData, enchantmentLevel]);

  const calculateTotalCost = (resources) => {
    return resources.reduce((total, resource) => {
      const resourcePrice = 192; // Example price for now
      return total + resource.count * resourcePrice;
    }, 0);
  };

  const handlePriceChange = (recipeIndex, price) => {
    const newItemPrices = { ...itemPrices, [recipeIndex]: price };
    setItemPrices(newItemPrices);

    // Calculate potential profit (example calculation: sale price - craft cost)
    const craftCost = calculateTotalCost(recipes[recipeIndex].materials);
    const potentialProfit = price - craftCost;
    setPotentialProfits({
      ...potentialProfits,
      [recipeIndex]: potentialProfit,
    });
  };

  return (
    <div className="location-price-display">
      <h3>Location: {location}</h3>

      {recipes.length > 0 ? (
        recipes.map((recipe, recipeIndex) => (
          <div
            key={`recipe-${recipeIndex}`}
            className="recipe-block"
            style={{ marginBottom: "40px" }}
          >
            <h4>
              Recipe {recipeIndex + 1} ({recipe.type})
            </h4>

            {/* Materials Section */}
            <div className="materials-section">
              {recipe.materials && recipe.materials.length > 0 ? (
                recipe.materials.map((material, materialIndex) => {
                  if (!material || !material.uniquename || !material.count) {
                    return null;
                  }

                  const imageUrl = `https://render.albiononline.com/v1/item/${appendEnchantment(
                    material.uniquename,
                    enchantmentLevel
                  )}.png`;

                  return (
                    <div
                      key={`${material.uniquename}-${recipeIndex}-${materialIndex}`} // Unique key for each material in the recipe
                      className="craft-material"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
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
                        </div>
                      </div>
                      <div>
                        <p>Total: {material.count * 192}.00</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No materials found for this recipe.</p>
              )}
            </div>

            {/* Total Craft Cost Section */}
            <div className="total-craft-cost-section">
              <p>
                <strong>Total Craft Cost for Recipe: </strong>
                {calculateTotalCost(recipe.materials || [])}
              </p>
            </div>

            {/* Item Price Input Section */}
            <div className="item-price-section">
              <label>
                <strong>
                  Item Price for {location} (Recipe {recipeIndex + 1}):{" "}
                </strong>
              </label>
              <input
                type="number"
                value={itemPrices[recipeIndex] || 0}
                onChange={(e) =>
                  handlePriceChange(
                    recipeIndex,
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>

            {/* Potential Profit Section */}
            <div className="potential-profit-section">
              <p>
                <strong>Potential Profit (Recipe {recipeIndex + 1}): </strong>
                {potentialProfits[recipeIndex] || 0}
              </p>
            </div>

            <hr style={{ margin: "20px 0", border: "1px solid #444" }} />
          </div>
        ))
      ) : (
        <p>No recipes available for this item.</p>
      )}
    </div>
  );
};

export default LocationPriceDisplay;
