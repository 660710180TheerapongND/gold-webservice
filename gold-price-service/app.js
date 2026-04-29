const express = require('express');
const cors = require('cors');
const { generatePrice } = require('./services/simulation');

const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { readData, writeData } = require('./services/storage'); 

const authMiddleware = require('./middlewares/auth');
const rateLimitMiddleware = require('./middlewares/rateLimit');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = 3000;
const { SECRET_KEY } = require('./config'); 

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
  catch (error) { console.error("Error saving users.json:", error.message); }
};

// --- API Signup ---
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
  res.status(201).json({ status: "success", message: "User created!" });
});

// --- API Login ---
app.post('/api/login', async (req, res) => {
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
    res.status(401).json({ status: "error", message: "Invalid credentials" });
  }
});

// --- API Upgrade ---
app.post('/api/upgrade', (req, res) => {
  const { email, plan } = req.body;
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex !== -1) {
    users[userIndex].plan = plan;
    saveUsers(users);
    res.json({ status: "success", message: "Plan upgraded successfully" });
  } else {
    res.status(404).json({ status: "error", message: "User not found" });
  }
});

// --- Gold Price Routes ---
setInterval(async () => { await generatePrice(); }, 10000);

app.get('/prices/latest', (req, res) => {
  try {
    const data = readData();
    if (data.length === 0) return res.status(404).json({ status: "error", message: 'ไม่มีข้อมูล' });
    const latest = data[data.length - 1];
    res.json({ status: "success", data: { price: latest.price, timestamp: latest.timestamp } });
  } catch (err) { res.status(500).json({ status: "error", message: 'Internal Server Error' }); }
});

app.get('/prices/history', (req, res) => {
  try { res.json({ status: "success", data: readData() }); }
  catch (err) { res.status(500).json({ status: "error", message: 'Internal Server Error' }); }
});

app.listen(PORT, () => { console.log(`Gold WebService is running on port ${PORT}`); });