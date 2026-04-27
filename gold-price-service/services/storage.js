const fs = require('fs'); /*1*/
const path = require('path'); /*1*/
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const filePath = path.join(__dirname, '../gold_data.json');/*1*/


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


/**
 * ✅ POST /prices
 */
app.post('/prices', (req, res) => {
  try {
    const newData = req.body;

    if (!validate(newData)) {
      return res.status(400).json({
        error: 'ต้องมี price และ timestamp'
      });
    }

    const data = readData();
    data.push(newData);
    writeData(data);

    res.status(201).json({
      message: 'เพิ่มข้อมูลสำเร็จ',
      data: newData
    });

  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });
  }
});

/**
 * ✅ GET /prices/latest
 */
app.get('/prices/latest', (req, res) => {
  try {
    const data = readData();

    if (data.length === 0) {
      return res.status(404).json({
        error: 'ไม่มีข้อมูล'
      });
    }

    res.json(data[data.length - 1]);

  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });
  }
});

/**
 * ✅ GET /prices/history
 */
app.get('/prices/history', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = { readData, writeData }; /*1*/