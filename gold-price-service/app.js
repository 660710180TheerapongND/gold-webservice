const express = require('express');
const bodyParser = require('body-parser');
const { readData, writeData } = require('./services/storage');

const app = express();
const port = 3000;

app.use(bodyParser.json());

/**
 * ✅ Data Validation
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

/**
 * ✅ POST /prices
 * รับข้อมูลแล้ว push ลงไฟล์
 */
app.post('/prices', (req, res) => {
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
});

/**
 * ✅ GET /prices/latest
 * เอาตัวล่าสุด
 */
app.get('/prices/latest', (req, res) => {
  const data = readData();

  if (data.length === 0) {
    return res.status(404).json({
      error: 'ไม่มีข้อมูล'
    });
  }

  res.json(data[data.length - 1]);
});

/**
 * ✅ GET /prices/history
 * เอาทั้งหมด
 */
app.get('/prices/history', (req, res) => {
  const data = readData();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});