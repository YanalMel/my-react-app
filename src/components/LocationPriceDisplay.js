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

// Define appendEnchantment function here
const appendEnchantment = (uniquename, enchantmentLevel) => {
  const isArtifact = uniquename.includes("ARTEFACT");
  if (enchantmentLevel > 0 && !isArtifact) {
    return `${uniquename}_LEVEL${enchantmentLevel}@${enchantmentLevel}`;
  }
  return uniquename;
};

const LocationPriceDisplay = ({
  location,
  itemData,
  enchantmentLevel,
  fetchTriggered,
  resetFetchTrigger,
}) => {
  const [recipes, setRecipes] = useState([]);
  const [itemPrices, setItemPrices] = useState({});
  const [potentialProfits, setPotentialProfits] = useState({});
  const [itemDisplayNames, setItemDisplayNames] = useState({});
  const [materialPrices, setMaterialPrices] = useState({});

  // Fetch and parse items.txt to map uniqueName -> displayName
  useEffect(() => {
    const fetchItemDisplayNames = async () => {
      try {
        const response = await fetch("/items.txt");
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

  // Deduplicate material names and trigger the API fetch
  const fetchApiPrices = useCallback(async () => {
    if (!fetchTriggered) return; // Do nothing if the fetch isn't triggered
    try {
      // Extract and deduplicate material names from recipes
      const materialNamesSet = new Set(
        recipes.flatMap((recipe) =>
          recipe.materials.map((material) => material.uniquename)
        )
      );

      // Construct the material names and API URL
      const materialNames = Array.from(materialNamesSet).join(",");
      const apiUrl = `https://west.albion-online-data.com/api/v2/stats/prices/${itemData.uniquename},${materialNames}?locations=${location}`;

      console.log("Fetching prices from API:", apiUrl); // Log the API call

      const response = await fetch(apiUrl);
      const data = await response.json();

      // Log the API response to the console for debugging purposes
      console.log("API Response:", data); // Log the API response

      const priceMap = {};
      data.forEach((price) => {
        priceMap[price.item_id] = price.sell_price_min || 0;
      });

      setMaterialPrices(priceMap);
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      resetFetchTrigger(); // Reset fetch trigger after fetching
    }
  }, [recipes, itemData, location, fetchTriggered, resetFetchTrigger]);

  // Extract base recipes and split nested arrays
  useEffect(() => {
    if (itemData && Array.isArray(itemData.craftresource)) {
      const processedRecipes = itemData.craftresource.map((resourceGroup) => {
        if (Array.isArray(resourceGroup.craftresource)) {
          return {
            type: resourceGroup.type,
            materials: processCraftResource(resourceGroup.craftresource),
          };
        }
        return null;
      });

      setRecipes(processedRecipes.filter(Boolean));
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

  return (
    <div className="location-price-display">
      <h3>Location: {location}</h3>

      {recipes.length > 0 ? (
        recipes.map((recipe, recipeIndex) => (
          <div key={`recipe-${recipeIndex}`} className="recipe-block">
            <h4>
              Recipe {recipeIndex + 1} ({recipe.type})
            </h4>

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
                      <div style={{ display: "flex", alignItems: "center" }}>
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
                        <p>
                          Total:{" "}
                          {material.count *
                            (materialPrices[material.uniquename] || 192)}
                          .00
                        </p>
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
