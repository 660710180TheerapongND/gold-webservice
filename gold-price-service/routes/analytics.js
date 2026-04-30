const express = require('express');
const router = express.Router();
const { getSummary, filterData } = require('../services/analytics');
const authMiddleware = require('../middlewares/auth');
const rateLimitMiddleware = require('../middlewares/rateLimit');

// 1. นำ Middleware มาใช้งานครอบทุก Route ในไฟล์นี้
router.use(authMiddleware);
router.use(rateLimitMiddleware);

// GET /api/analytics/summary
router.get('/summary', (req, res) => {
    try {
        const result = getSummary();
        res.status(200).json({ status: "success", data: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server Error" });
    }
});

// GET /api/analytics/filter
router.get('/filter', (req, res) => {
    const { min, max, date } = req.query;
    
    // 2. ปรับปรุงการแปลงค่า เพื่อกันค่าที่เป็น NaN หรือ undefined
    const minVal = min ? Number(min) : undefined;
    const maxVal = max ? Number(max) : undefined;
    
    try {
        const result = filterData(minVal, maxVal, date);
        res.status(200).json({ status: "success", data: result });
    } catch (error) {
        // จัดการกรณี Min > Max (Error 400)
        if (error.message.includes("Invalid range")) {
            return res.status(400).json({ status: "error", message: error.message });
        }
        res.status(500).json({ status: "error", message: "Server Error" });
    }
});

module.exports = router;