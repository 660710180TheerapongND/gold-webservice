const fs = require('fs'); /*1*/
const path = require('path'); /*1*/


const filePath = path.resolve(__dirname, '../repository/gold_data.json');/*1*/


/*1*/
/**
 * ✅ อ่านไฟล์
 * ถ้าไฟล์หาย หรือ JSON พัง → throw 500
 */
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

/**
 * ✅ เขียนไฟล์
 */
function writeData(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    const error = new Error('Internal Server Error: cannot write file');
    error.status = 500;
    throw error;
  }
}

/**
 * ✅ Validation
 */
function validate(data) {
  return (
    data &&
    typeof data.price === "number" &&
    !isNaN(data.price) &&
    typeof data.timestamp === "string" &&
    data.timestamp.trim() !== ""
  );
}
/*1*/




module.exports = { readData, writeData }; /*1*/