const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../gold_data.json');

// อ่านไฟล์
function readData() {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // ถ้าไม่มีไฟล์ → สร้างใหม่
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }
    throw err;
  }
}

// เขียนไฟล์
function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readData, writeData };