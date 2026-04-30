// services/analytics.js
const fs = require('fs');
const path = require('path');

path.resolve(__dirname, '../repository/gold_data.json');

// Helper function สำหรับอ่านข้อมูล
const getGoldData = () => {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
};

// Logic สำหรับ /summary
const getSummary = () => {
    const data = getGoldData();
    const prices = data.map(item => item.price);
    
    return {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2),
        count: prices.length
    };
};

// Logic สำหรับ /filter
const filterData = (min, max, date) => {
    const data = getGoldData();
    
    // Validate: ถ้า Min > Max ให้ส่ง Error ออกไป
    if (min && max && min > max) {
        throw new Error("Invalid range: Min price cannot be greater than Max price.");
    }

    return data.filter(item => {
        let match = true;
        if (min) match = match && item.price >= min;
        if (max) match = match && item.price <= max;
        if (date) match = match && item.date === date;
        return match;
    });
};

module.exports = { getSummary, filterData };