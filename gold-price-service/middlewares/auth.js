// รายชื่อ API Key ที่อนุญาตให้ผ่านได้
const validApiKeys = {
  'key-basic': 'basic',
  'key-silver': 'silver',
  'key-gold': 'gold'
};

// สร้าง Middleware Function
const authMiddleware = (req, res, next) => {
  // 1. ดึงค่า x-api-key ที่คนเรียกส่งมาทาง Header
  const apiKey = req.headers['x-api-key'];

  // 2. เช็คว่า "ไม่ได้ส่ง Key มา" หรือ "Key ไม่มีอยู่ในระบบ (validApiKeys)"
  if (!apiKey || !validApiKeys[apiKey]) {
    // 3. ถ้าผิดเงื่อนไข ให้ตีกลับเป็น Error 401 พร้อม JSON Format
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Unauthorized: Invalid API Key"
    });
  }

  // 4. แนบชื่อแพ็กเกจใส่ req ของคนที่เรียกเข้ามา
  req.userPlan = validApiKeys[apiKey];

  // 5. ถ้า Key ถูกต้อง ให้เรียก next() เพื่ออนุญาตให้เดินผ่านประตูไป Service ถัดไป
  next();
};

module.exports = authMiddleware;