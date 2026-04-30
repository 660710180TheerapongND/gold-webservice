

/**
 * @param {string[]} allowedPlans
 */
const authorizePlan = (allowedPlans) => {
    return (req, res, next) => {
        
        const userPlan = req.userPlan || (req.user && req.user.plan);
        
        if (!userPlan) {
            return res.status(403).json({
                status: "error",
                code: 403,
                message: "Forbidden: No plan information found"
            });
        }

       
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