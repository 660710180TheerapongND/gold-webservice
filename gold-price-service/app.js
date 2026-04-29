const express = require('express');
const { generatePrice } = require('./services/simulation');

const app = express();
const PORT = 3000;

app.use(express.json()); // สำหรับให้ Express อ่าน JSON body ได้

// เริ่มการทำงาน: สุ่มราคาทุกๆ 10 วินาที (10000 มิลลิวินาที)
console.log("Starting gold price simulation...");
setInterval(async () => {
    await generatePrice();
}, 10000);

// Endpoint พื้นฐานสำหรับทดสอบ Service ของเราเอง
app.get('/api/gold', (req, res) => {
    const { readGoldData } = require('./services/storage');
    res.json(readGoldData());
});

app.listen(PORT, () => {
    console.log(`Gold WebService is running on port ${PORT}`);
});