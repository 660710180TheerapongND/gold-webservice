const jwt = require('jsonwebtoken');
const SECRET_KEY = "SECRET_KEY"; // กุญแจสำหรับเซ็นชื่อบัตร

const authMiddleware = (req, res, next) => {
    // 1. ดึง Token จาก Header "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: "error",
            code: 401,
            message: "Unauthorized: No Token Provided"
        });
    }

    // 2. ตรวจสอบความถูกต้องของบัตร (JWT)
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: "error",
                code: 401,
                message: "Unauthorized: Invalid or Expired Token"
            });
        }

        // 3. แนบข้อมูลเข้าไปใน Request 
        req.user = decoded;
        req.userPlan = decoded.plan;
        next();
    });
};

module.exports = authMiddleware;