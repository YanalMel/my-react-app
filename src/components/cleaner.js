const fs = require("fs");
const path = require("path");

// Function to flatten each recipe while keeping separate recipes intact
const cleanJsonFile = (jsonData) => {
  jsonData.equipmentitem = jsonData.equipmentitem.map((item) => {
    if (item.craftresource && Array.isArray(item.craftresource)) {
      // Process each recipe group and flatten only the nested resources inside
      item.craftresource = item.craftresource.map((resourceGroup) => {
        if (
          resourceGroup.craftresource &&
          Array.isArray(resourceGroup.craftresource)
        ) {
          // Maintain separate recipes and flatten resources within each recipe group
          return {
            type: resourceGroup.type,
            craftresource: resourceGroup.craftresource.map((recipe) => {
              // Flatten nested layers in each recipe
              if (Array.isArray(recipe.craftresource)) {
                return recipe.craftresource.map((material) => ({
                  uniquename: material.uniquename,
                  count: material.count,
                }));
              }
              return {
                uniquename: recipe.uniquename,
                count: recipe.count,
              };
            }),
          };
        }
        return resourceGroup;
      });
    }
    return item;
  });

  return jsonData;
};

// Read and clean the JSON file
const inputFilePath = path.join(__dirname, "../../public/Output.json");
const outputFilePath = inputFilePath;

fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  const jsonData = JSON.parse(data);
  const cleanedData = cleanJsonFile(jsonData);

  fs.writeFile(
    outputFilePath,
    JSON.stringify(cleanedData, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing the file:", err);
      } else {
        console.log(
          "The file has been cleaned and saved successfully, keeping recipes separate!"
        );
      }
    }
  );
});
