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

// Define appendEnchantment function here
const appendEnchantment = (uniquename, enchantmentLevel) => {
  const isArtifact = uniquename.includes("ARTEFACT");
  if (enchantmentLevel > 0 && !isArtifact) {
    return `${uniquename}_LEVEL${enchantmentLevel}@${enchantmentLevel}`;
  }
  return uniquename;
};

const LocationPriceDisplay = ({ location, itemData, enchantmentLevel }) => {
  const [recipes, setRecipes] = useState([]);
  const [itemPrices, setItemPrices] = useState({});
  const [potentialProfits, setPotentialProfits] = useState({});
  const [itemDisplayNames, setItemDisplayNames] = useState({});

  // Fetch and parse items.txt to map uniqueName -> displayName
  useEffect(() => {
    const fetchItemDisplayNames = async () => {
      try {
        const response = await fetch("/items.txt"); // Ensure items.txt is accessible
        const text = await response.text();

        const items = text.split("\n").map((line) => {
          const [, uniqueNameWithSpaces, displayName] = line.split(":");
          if (uniqueNameWithSpaces && displayName) {
            return {
              uniqueName: uniqueNameWithSpaces.trim(),
              displayName: displayName.trim(),
            };
          }
          return null;
        });

        // Create a mapping of uniqueName to displayName
        const displayNameMap = {};
        items.forEach((item) => {
          if (item && item.uniqueName && item.displayName) {
            displayNameMap[item.uniqueName] = item.displayName;
          }
        });
        setItemDisplayNames(displayNameMap);
      } catch (error) {
        console.error("Error fetching items.txt:", error);
      }
    };

    fetchItemDisplayNames();
  }, []);

  // Extract base recipes and split nested arrays
  useEffect(() => {
    if (itemData && Array.isArray(itemData.craftresource)) {
      const processedRecipes = itemData.craftresource.map((resourceGroup) => {
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
      setRecipes([]);
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
          <div key={`recipe-${recipeIndex}`} className="recipe-block">
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

                  const displayName =
                    itemDisplayNames[material.uniquename] ||
                    material.uniquename;

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
                      <div className="material-total">
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

            {/* Potential Profit Section */}
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
