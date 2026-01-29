const fs = require("node:fs/promises");
const path = require("node:path");

const readFromFile = async (fileName) => {
  try {
    const filePath = path.join(__dirname, "..", "data", fileName);
    const data = await fs.readFile(filePath, "utf-8");
    console.log(JSON.parse(data));
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
  }
};

const writeToFile = async (fileName, newData) => {
  try {
    const filePath = path.join(__dirname, "..", "data", fileName);
    const data = await fs.readFile(filePath, "utf-8");
    const items = JSON.parse(data);

    items.films.push(newData);

    await fs.writeFile(filePath, JSON.stringify(items, null, 2));
    console.log("Basariyla eklendi!");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  readFromFile,
  writeToFile,
};
