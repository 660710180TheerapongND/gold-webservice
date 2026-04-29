const crypto = require('crypto');
const { saveGoldData } = require('./storage');

// สมมติราคาเริ่มต้นที่ 40,000 บาท
let currentPrice = 40000; 

async function generatePrice() {
    // 1. สุ่มราคาใหม่ (ขึ้นหรือลงแบบสุ่ม - สมมติให้แกว่งทีละไม่เกิน 500 บาท)
    const priceChange = Math.floor(Math.random() * 1001) - 500; 
    const newPrice = currentPrice + priceChange;

    // 2. คำนวณ Trend
    let currentTrend = 'stable';
    if (newPrice > currentPrice) {
        currentTrend = 'up';
    } else if (newPrice < currentPrice) {
        currentTrend = 'down';
    }
    
    currentPrice = newPrice; // อัปเดตราคาล่าสุด

    // 3. สร้าง Object ตามโครงสร้างที่กำหนด
    const goldDataPayload = {
        id: crypto.randomUUID(), // สร้าง ID แบบสุ่ม (ต้องใช้ Node v16.7+)
        price: newPrice,
        trend: currentTrend,
        timestamp: new Date().toISOString(),
        source: "SimulationService"
    };

    // 4. บันทึกลงไฟล์ JSON 
    saveGoldData(goldDataPayload);
    console.log(`[Local Saved] Price: ${newPrice} | Trend: ${currentTrend}`);

    // 5. ส่ง Webhook ไปหา Service ของภู (Gold Pricing)
    try {
        const phuServiceUrl = 'http://localhost:4000/api/webhook/gold'; // เปลี่ยนเป็น URL จริงของภู
        const response = await fetch(phuServiceUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goldDataPayload)
        });
        
        if (response.ok) {
            console.log(`[Webhook Sent] Successfully sent data to Phu's service.`);
        }
    } catch (error) {
        console.error(`[Webhook Failed] Could not reach Phu's service:`, error.message);
    }
}

module.exports = { generatePrice };