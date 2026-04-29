const rateLimitStore = new Map();

const WINDOW_SIZE = 60 * 1000;

const PLAN_LIMIT = {
    basic: 5,
    silver: 10,
    gold: 20
};

function rateLimitMiddleware(req, res, next) {
    const apiKey = req.user.username; // ใช้ key เป็นตัวนับ
    const plan = req.userPlan || 'basic'; // มาจาก auth

    const MAX_REQUESTS = PLAN_LIMIT[plan];

    const currentTime = Date.now();

    if (!rateLimitStore.has(apiKey)) {
        rateLimitStore.set(apiKey, {
            count: 1,
            startTime: currentTime
        });

        attachInfo(req, apiKey, 1, MAX_REQUESTS, WINDOW_SIZE);
        return next();
    }

    const data = rateLimitStore.get(apiKey);

    if (currentTime - data.startTime > WINDOW_SIZE) {
        data.count = 1;
        data.startTime = currentTime;

        attachInfo(req, apiKey, 1, MAX_REQUESTS, WINDOW_SIZE);
        return next();
    }

    data.count++;

    const timeLeft = WINDOW_SIZE - (currentTime - data.startTime);

    if (data.count > MAX_REQUESTS) {
        return res.status(429).json({
            status: "error",
            code: 429,
            message: "Too Many Requests",
            retryAfter: Math.ceil(timeLeft / 1000),
            plan: plan
        });
    }

    attachInfo(req, apiKey, data.count, MAX_REQUESTS, timeLeft);
    next();
}

function attachInfo(req, key, count, max, timeLeft) {
    req.rateLimitInfo = {
        key,
        plan: req.userPlan,
        used: count,
        remaining: max - count,
        limit: max,
        resetIn: timeLeft
    };
}

module.exports = rateLimitMiddleware;