const express = require('express');
const { generatePrice } = require('./services/simulation');

const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('./middlewares/auth');
const authorizePlan = require('./middlewares/authorize');
const rateLimitMiddleware = require('./middlewares/rateLimit');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = 3000;
const SECRET_KEY = "SECRET_KEY"; // กุญแจสำหรับเซ็นชื่อบัตร

app.use(express.json()); // สำหรับให้ Express อ่าน JSON body ได้

// --- Helper สำหรับจัดการ Users ---
const getUsers = () => JSON.parse(fs.readFileSync('./users.json', 'utf8') || '[]');
const saveUsers = (users) => fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));

// --- API Signup ---
app.post('/api/signup', async (req, res) => {
    const { username, password, plan } = req.body;
    const users = getUsers();

    // --- เพิ่มส่วนเช็คระดับที่อนุญาต ---
    const allowedPlans = ['basic', 'silver', 'gold'];
    // ถ้าส่ง plan มา แต่ไม่อยู่ใน 3 ชื่อนี้ ให้ปัดตกไปเป็น 'basic' ทั้งหมด
    const finalPlan = allowedPlans.includes(plan) ? plan : 'basic';

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ status: "error", message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword, plan: finalPlan };
    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ status: "success", message: "User created!" });
});

// ---  API Login ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            { username: user.username, plan: user.plan }, 
            SECRET_KEY, 
            { expiresIn: '1h' }
        );
        res.json({ status: "success", token });
    } else {
        res.status(401).json({ status: "error", code: 401, message: "Invalid credentials" });
    }
});

// เริ่มการทำงาน: สุ่มราคาทุกๆ 10 วินาที (10000 มิลลิวินาที)
console.log("Starting gold price simulation...");
setInterval(async () => {
    await generatePrice();
}, 10000);

// Endpoint ทดสอบ
app.get('/api/gold', 
    authMiddleware,         // ด่าน 1: ตรวจบัตร (เอา username ออกมา)
    rateLimitMiddleware,    // ด่าน 2: ตรวจโควต้า (อิงตาม plan ในบัตร)
    (req, res) => {
        const { readData } = require('./services/storage');
        res.json({
            status: "success",
            user: req.user.username, 
            plan: req.userPlan, // โชว์ว่าคนนี้คือ basic, silver หรือ gold
            data: readData()
        });
    }
);

app.use('/api/analytics', analyticsRoutes);

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
app.listen(PORT, () => {
    console.log(`Gold WebService is running on port ${PORT}`);
});