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
        status: "error",
        code: 400,
        message: 'ต้องมี price และ timestamp'
      });
    }

    const data = readData();
    data.push(newData);
    writeData(data);

    const responseData = {
      id: `gold-${data.length.toString().padStart(3, '0')}`,
      price: newData.price,
      trend: data.length > 1 ? (newData.price > data[data.length - 2].price ? 'up' : 'down') : 'up',
      timestamp: newData.timestamp,
      source: 'Simulation-A'
    };

    res.status(201).json({
      status: "success",
      data: responseData
    });

  } catch (err) {
    res.status(err.status || 500).json({
      status: "error",
      code: err.status || 500,
      message: err.message || 'Internal Server Error'
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
        status: "error",
        code: 404,
        message: 'ไม่มีข้อมูล'
      });
    }

    const latest = data[data.length - 1];
    const previous = data.length > 1 ? data[data.length - 2] : null;

    const responseData = {
      id: `gold-${data.length.toString().padStart(3, '0')}`,
      price: latest.price,
      trend: previous ? (latest.price > previous.price ? 'up' : 'down') : 'up',
      timestamp: latest.timestamp,
      source: 'Simulation-A'
    };

    res.json({
      status: "success",
      data: responseData
    });

  } catch (err) {
    res.status(err.status || 500).json({
      status: "error",
      code: err.status || 500,
      message: err.message || 'Internal Server Error'
    });
  }
});

/**
 * ✅ GET /prices/history
 */
app.get('/prices/history', (req, res) => {
  try {
    const data = readData();

    const responseData = data.map((item, index) => {
      const previous = index > 0 ? data[index - 1] : null;
      return {
        id: `gold-${(index + 1).toString().padStart(3, '0')}`,
        price: item.price,
        trend: previous ? (item.price > previous.price ? 'up' : 'down') : 'up',
        timestamp: item.timestamp,
        source: 'Simulation-A'
      };
    });

    res.json({
      status: "success",
      data: responseData
    });

  } catch (err) {
    res.status(err.status || 500).json({
      status: "error",
      code: err.status || 500,
      message: err.message || 'Internal Server Error'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = { readData, writeData }; /*1*/