const crypto = require('crypto');
const { readData, writeData } = require('./storage'); // เรียกใช้ Module จัดการไฟล์

let currentPrice = 40000; 

async function generatePrice() {
    // 1. สุ่มราคาใหม่ (ให้แกว่งขึ้นลงไม่เกิน 500 บาทจากราคาเดิม)
    const priceChange = Math.floor(Math.random() * 1001) - 500;
    const newPrice = currentPrice + priceChange;

    // 2. Logic กำหนด Trend
    let currentTrend = 'stable';
    if (newPrice > currentPrice) {
        currentTrend = 'up';
    } else if (newPrice < currentPrice) {
        currentTrend = 'down';
    }
    
    // อัปเดตราคาล่าสุด
    currentPrice = newPrice; 

    // 3. จัดเตรียมข้อมูลตามโครงสร้าง Object ที่โจทย์กำหนด
    const goldDataPayload = {
        id: crypto.randomUUID(), 
        price: newPrice,
        trend: currentTrend,
        timestamp: new Date().toISOString(), // รูปแบบ ISO
        source: "SimulationService"
    };

    // 4. บันทึกข้อมูลลงไฟล์ gold_data.json ผ่าน storage module
    try {
        const currentData = readData();   // ดึงข้อมูลเดิมที่เป็น Array
        currentData.push(goldDataPayload); // ดัน Object ใหม่เข้าไป
        writeData(currentData);           // เซฟทับลงไฟล์
        console.log(`[Saved] Price: ${newPrice} | Trend: ${currentTrend}`);
    } catch (error) {
        console.error("[Error] ไม่สามารถบันทึกข้อมูลลงไฟล์ได้:", error.message);
    }
}

module.exports = { generatePrice };