const express = require('express');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { readData } = require('./services/storage'); 
const { generatePrice } = require('./services/simulation'); 

const app = express();
const PORT = 3000;
const SECRET_KEY = 'gold-tracker-secret-2026'; 

app.use(cors());
app.use(express.json()); 

// --- Helpers สำหรับจัดการไฟล์ users.json ---
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

// ─── AUTHENTICATION ROUTES ────────────────────────────────────────

// --- API Login --
app.post('/api/login', async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ status: "error", message: "Request body is missing" });

    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username || u.email === username);

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ username: user.username, plan: user.plan }, SECRET_KEY, { expiresIn: '1h' });
      res.json({
        status: "success",
        token,
        user: { username: user.username, email: user.email, plan: user.plan, apiKey: user.apiKey }
      });
    } else {
      res.status(401).json({ status: "error", message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// --- API Signup --
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


app.post('/api/upgrade', (req, res) => {
  const { email, plan } = req.body;
  const users = getUsers();
  

  const userIndex = users.findIndex(u => 
    u.email && email && u.email.toLowerCase() === email.toLowerCase()
  );

  if (userIndex !== -1) {
    users[userIndex].plan = plan;
    saveUsers(users);
    res.json({ status: "success", message: "Plan upgraded successfully" });
  } else {
    res.status(404).json({ status: "error", message: "User not found" });
  }
});

// ─── PRICE ROUTES ────────────────────────────────────────────────

setInterval(async () => { await generatePrice(); }, 10000); 

app.get('/prices/latest', (req, res) => {
  const data = readData();
  const latest = data[data.length - 1];
  res.json({ status: "success", data: latest });
});

app.get('/prices/history', (req, res) => {
  res.json({ status: "success", data: readData() });
});

// ─── START SERVER ───────────────────────────────────────────────

app.listen(PORT, () => { 
  console.log(`🚀 Server ready at http://localhost:${PORT}`); 
});