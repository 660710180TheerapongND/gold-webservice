/**
 * @param {string[]} allowedPlans - รายชื่อ Plan ที่อนุญาตให้ผ่าน
 */
const authorizePlan = (allowedPlans) => {
    return (req, res, next) => {
        // 1. ตรวจสอบว่ามีข้อมูล Plan มาจาก authMiddleware หรือยัง
        const userPlan = req.userPlan || (req.user && req.user.plan);
        
        if (!userPlan) {
            return res.status(403).json({
                status: "error",
                code: 403,
                message: "Forbidden: No plan information found"
            });
        }

        // 2. เช็คว่า Plan ของ User คนนี้ อยู่ในกลุ่มที่ได้รับอนุญาตหรือไม่
        if (!allowedPlans.includes(userPlan)) {
            return res.status(403).json({
                status: "error",
                code: 403,
                message: `Forbidden: This feature is reserved for ${allowedPlans.join(' or ')} users.`
            });
        }

        next();
    };
};

module.exports = authorizePlan;