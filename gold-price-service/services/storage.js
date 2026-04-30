const fs = require('fs'); 
const path = require('path'); 


const filePath = path.resolve(__dirname, '../repository/gold_data.json');

function readData() {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT' || err instanceof SyntaxError) {
      const error = new Error('Internal Server Error: cannot read gold_data.json');
      error.status = 500;
      throw error;
    }
    throw err;
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    const error = new Error('Internal Server Error: cannot write file');
    error.status = 500;
    throw error;
  }
}

function validate(data) {
  return (
    data &&
    typeof data.price === "number" &&
    !isNaN(data.price) &&
    typeof data.timestamp === "string" &&
    data.timestamp.trim() !== ""
  );
}

module.exports = { readData, writeData }; 