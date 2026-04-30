const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config'); 

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: "error",
            code: 401,
            message: "Unauthorized: No Token Provided"
        });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: "error",
                code: 401,
                message: "Unauthorized: Invalid or Expired Token"
            });
        }

        req.user = decoded;
        req.userPlan = decoded.plan;
        next();
    });
};

module.exports = authMiddleware;