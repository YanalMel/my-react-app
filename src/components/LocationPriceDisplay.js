import React, { useState, useEffect, useCallback } from "react";

// Recursive function to handle nested craftresource arrays safely
const processCraftResource = (craftresourceArray) => {
  let materials = [];

  if (Array.isArray(craftresourceArray)) {
    craftresourceArray.forEach((material) => {
      if (material.craftresource) {
        materials = materials.concat(
          processCraftResource(material.craftresource)
        );
      } else {
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
      // First level of craftresource (recipes)
      const topLevelCraftResources = itemData.craftresource;

      // Safely map over top-level resources and their nested resources
      const processedRecipes = topLevelCraftResources.map((resource) => {
        // Ensure that resource.craftresource exists and is an array
        return Array.isArray(resource.craftresource)
          ? resource.craftresource.map((nestedResource) => ({
              materials: processCraftResource(nestedResource.craftresource),
            }))
          : [];
      });

      // Flatten the resulting array of recipes
      const flattenedRecipes = processedRecipes.flat();
      setRecipes(flattenedRecipes);
    } else {
      setRecipes([]);
    }
  }, [itemData]);

  // Trigger fetchApiPrices only when fetchTriggered is true
  useEffect(() => {
    if (fetchTriggered) {
      console.log("Fetch Triggered: Calling API");
      fetchApiPrices();
    }
  }, [fetchTriggered, fetchApiPrices]);

  const calculateTotalCost = (resources) => {
    return resources.reduce((total, resource) => {
      const resourcePrice = materialPrices[resource.uniquename] || 192; // Fallback price
      return total + resource.count * resourcePrice;
    }, 0);
  };

  const handlePriceChange = (recipeIndex, price) => {
    const newItemPrices = { ...itemPrices, [recipeIndex]: price };
    setItemPrices(newItemPrices);

    const craftCost = calculateTotalCost(recipes[recipeIndex].materials);
    const potentialProfit = price - craftCost;
    setPotentialProfits({
      ...potentialProfits,
      [recipeIndex]: potentialProfit,
    });
  };

  if (loading) {
    return <p>Loading prices...</p>; // Show loading message while API call is in progress
  }

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
            <h4>Recipe {recipeIndex + 1}</h4>

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
                      key={`${material.uniquename}-${recipeIndex}-${materialIndex}`}
                      className="craft-material"
                    >
                      <div className="material-details">
                        <img
                          src={imageUrl}
                          alt={material.uniquename}
                          className="material-image"
                        />
                        <div>
                          <p>
                            {displayName} (x{material.count})
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

            <div className="total-craft-cost-section">
              <p>
                <strong>Total Craft Cost for Recipe: </strong>
                {calculateTotalCost(recipe.materials || [])}
              </p>
            </div>

            <div className="item-price-section">
              <label>
                <strong>
                  Item Price for {location} (Recipe {recipeIndex + 1}):
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

            <div className="potential-profit-section">
              <p>
                <strong>Potential Profit (Recipe {recipeIndex + 1}): </strong>
                {potentialProfits[recipeIndex] || 0}
              </p>
            </div>

            <hr className="divider" />
          </div>
        ))
      ) : (
        <p>No recipes available for this item.</p>
      )}
    </div>
  );
};

export default LocationPriceDisplay;
