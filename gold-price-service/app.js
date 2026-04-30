const express = require('express');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// จัดการข้อมูล (เปลี่ยน Path ให้ตรงกับที่หัวหน้าใช้นะครับ)
const { readData } = require('./services/storage'); 
const { generatePrice } = require('./services/simulation'); 

const app = express();
const PORT = 3000;
const SECRET_KEY = 'gold-tracker-secret-2026'; // ตั้งค่าตรงนี้ให้ตรงกับ config.js

// ✅ จุดสำคัญ: ต้องวาง 2 บรรทัดนี้ไว้ "ก่อน" Route ทุกอย่าง
app.use(cors());
app.use(express.json()); 

const getUsers = () => {
  try {
    const data = fs.readFileSync('./users.json', 'utf8');
    return data.trim() ? JSON.parse(data) : [];
  } catch (error) { return []; }
};

const saveUsers = (users) => {
  try { fs.writeFileSync('./users.json', JSON.stringify(users, null, 2)); }
  catch (error) { console.error("Error saving users:", error.message); }
};

// --- API Login ---
app.post('/api/login', async (req, res) => {
  try {
    // 🛡️ ป้องกันอาการ req.body เป็น undefined[cite: 3]
    if (!req.body) {
      return res.status(400).json({ status: "error", message: "Request body is missing" });
    }

    const { username, password } = req.body;
    const users = getUsers();
    
    // ค้นหาจากทั้ง username หรือ email[cite: 3]
    const user = users.find(u => u.username === username || u.email === username);

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { username: user.username, plan: user.plan }, 
        SECRET_KEY, 
        { expiresIn: '1h' }
      );
      res.json({
        status: "success",
        token,
        user: { username: user.username, email: user.email, plan: user.plan, apiKey: user.apiKey }
      });
    } else {
      res.status(401).json({ status: "error", message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// --- API Signup ---[cite: 3]
app.post('/api/signup', async (req, res) => {
  const { username, email, password, plan } = req.body;
  const users = getUsers();
  if (users.find(u => u.username === username || u.email === email)) {
    return res.status(400).json({ status: "error", message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { 
    username, email, password: hashedPassword, plan: plan || 'basic',
    apiKey: `gt_live_${Math.random().toString(36).substr(2, 9)}` 
  };
  users.push(newUser);
  saveUsers(users);
  res.status(201).json({ status: "success", message: "สมัครสมาชิกสำเร็จ!" });
});

// --- Price Routes ---[cite: 3]
setInterval(async () => { await generatePrice(); }, 10000);

app.get('/prices/latest', (req, res) => {
  const data = readData();
  const latest = data[data.length - 1];
  res.json({ status: "success", data: latest });
});

app.get('/prices/history', (req, res) => {
  res.json({ status: "success", data: readData() });
});

app.listen(PORT, () => { console.log(`🚀 Server ready at http://localhost:${PORT}`); });