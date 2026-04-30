
const crypto = require('crypto');
const { readData, writeData } = require('./storage'); // เรียกใช้ Module จัดการไฟล์

let currentPrice = 40000; 

async function generatePrice() {
 
    const priceChange = Math.floor(Math.random() * 1001) - 500;
    const newPrice = currentPrice + priceChange;

  
    let currentTrend = 'stable';
    if (newPrice > currentPrice) {
        currentTrend = 'up';
    } else if (newPrice < currentPrice) {
        currentTrend = 'down';
    }
    
 
    currentPrice = newPrice; 


    const goldDataPayload = {
        id: crypto.randomUUID(), 
        price: newPrice,
        trend: currentTrend,
        timestamp: new Date().toISOString(), // รูปแบบ ISO
        source: "SimulationService"
    };


    try {
        const currentData = readData(); 
        currentData.push(goldDataPayload); 
        writeData(currentData);           // เซฟทับลงไฟล์
        console.log(`[Saved] Price: ${newPrice} | Trend: ${currentTrend}`);
    } catch (error) {
        console.error("[Error] ไม่สามารถบันทึกข้อมูลลงไฟล์ได้:", error.message);
    }

   
    /*try {
        const phuWebhookUrl = 'http://localhost:4000/api/webhook/gold'; // เปลี่ยนเป็น URL จริง
        const response = await fetch(phuWebhookUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goldDataPayload)
        });
        
        if (response.ok) {
            console.log(`[Webhook] ส่งข้อมูลให้ภูสำเร็จ!`);
        } else {
            console.log(`[Webhook] ส่งสำเร็จแต่ Service ปลายทางตอบกลับ Error: ${response.status}`);
        }
    } catch (error) {
        console.error(`[Webhook] ส่งข้อมูลล้มเหลว (ปลายทางอาจจะยังไม่เปิด Service):`, error.message);
    }*/
}

module.exports = { generatePrice };