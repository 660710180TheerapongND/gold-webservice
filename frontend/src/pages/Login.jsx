import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // เพิ่ม useLocation

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // เช็กว่าผู้ใช้ถูกส่งมาจากหน้าไหน (ถ้าไม่มี ให้ตั้งค่าเริ่มต้นไปที่ /dashboard)
  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = (e) => {
    e.preventDefault();
    
    // จำลองการล็อกอิน (เดี๋ยวค่อยเชื่อมกับ API ของมิ้น)
    console.log("Login with:", username);
    
    // บันทึก Key ลงเครื่อง
    localStorage.setItem('gt_api_key', 'mock_key_123'); 
    
    // ดีดผู้ใช้กลับไปยังหน้าที่เขาจะเข้าทีแรก หรือหน้า Dashboard
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#EFEAD8] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FDFAF4] rounded-2xl shadow-2xl overflow-hidden border border-orange-200/20 p-8">
        <h2 className="font-serif text-3xl font-black text-[#1A1410] mb-2 uppercase tracking-tighter">Sign In</h2>
        <p className="text-[#8B6210] text-sm mb-8">เข้าสู่ระบบเพื่อจัดการ Web Service ของคุณ</p>
        
        {/* แสดงข้อความแจ้งเตือนถ้าถูกดีดมาจากหน้าอื่น (Optional) */}
        {location.state?.from && (
          <p className="mb-4 text-xs text-red-500 font-bold italic">
            * กรุณาเข้าสู่ระบบก่อนเข้าใช้งานหน้านี้
          </p>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B6210] mb-2">Username</label>
            <input 
              type="text" 
              className="w-full bg-[#F5EDD8] border border-orange-200/30 rounded-lg p-3 outline-none focus:border-[#C8922A]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B6210] mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#F5EDD8] border border-orange-200/30 rounded-lg p-3 outline-none focus:border-[#C8922A]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-[#1A1410] text-[#E8B84B] py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#2E2010] transition-all">
            เข้าสู่ระบบ
          </button>
        </form>
        <p className="mt-8 text-xs text-gray-500">
          ยังไม่มีบัญชี? <Link to="/" className="text-[#C8922A] font-bold">เลือกแพ็กเกจที่นี่</Link>
        </p>
      </div>
    </div>
  );
}