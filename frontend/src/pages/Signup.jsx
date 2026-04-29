import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'basic'; // ดึงค่า plan จาก URL
  const navigate = useNavigate();

  // 1. เพิ่ม State สำหรับเก็บข้อมูลที่ User กรอก
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  // 2. ฟังก์ชันจัดการการเปลี่ยนแปลงใน Input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. ฟังก์ชันส่งข้อมูล (จะไปเชื่อมกับ API ของมิ้น)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // ตรวจสอบว่ารหัสผ่านตรงกันไหม
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    // ข้อมูลที่จะส่งให้มิ้น (อ้างอิงจาก Logic ที่มิ้นวางไว้)
    const signupData = {
      username: formData.username,
      password: formData.password,
      plan: selectedPlan
    };

    console.log("Sending to Mint's Backend:", signupData);

    // จำลองว่าสมัครสำเร็จ (เดี๋ยวค่อยใช้ axios ยิงไปที่ users.json ของมิ้น)
    alert("สร้างบัญชีสำเร็จ! ยินดีต้อนรับสู่ครอบครัว Gold Tracker");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#EFEAD8] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#FDFAF4] rounded-2xl shadow-2xl overflow-hidden border border-orange-200/20 p-8">
        <h2 className="font-serif text-3xl font-black text-[#1A1410] mb-2 uppercase tracking-tighter">Sign Up</h2>
        
        {/* แสดงแผนที่เลือกมา */}
        <div className="mb-6 p-3 bg-orange-100/50 rounded-lg border border-orange-200/50">
           <p className="text-[10px] font-bold text-[#8B6210] uppercase tracking-widest">Selected Plan</p>
           <p className="text-lg font-black text-[#C8922A] uppercase">{selectedPlan}</p>
        </div>

        {/* แสดง Error ถ้ามี */}
        {error && <p className="mb-4 text-xs text-red-500 font-bold italic">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Username */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B6210] mb-1">Username</label>
            <input 
              name="username"
              type="text" 
              className="w-full bg-[#F5EDD8] border border-orange-200/30 rounded-lg p-3 outline-none focus:border-[#C8922A]" 
              value={formData.username}
              onChange={handleChange}
              required 
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B6210] mb-1">Password</label>
            <input 
              name="password"
              type="password" 
              className="w-full bg-[#F5EDD8] border border-orange-200/30 rounded-lg p-3 outline-none focus:border-[#C8922A]" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>

          {/* Confirm Password (ที่สัญญาไว้ในคอมเมนต์) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B6210] mb-1">Confirm Password</label>
            <input 
              name="confirmPassword"
              type="password" 
              className="w-full bg-[#F5EDD8] border border-orange-200/30 rounded-lg p-3 outline-none focus:border-[#C8922A]" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#C8922A] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest mt-4 hover:bg-[#A07020] transition-all shadow-lg active:scale-95"
          >
            สร้างบัญชีสมาชิก
          </button>
        </form>

        <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest text-center">
          มีบัญชีอยู่แล้ว? <a href="/login" className="text-[#C8922A] font-bold underline">Log In</a>
        </p>
      </div>
    </div>
  );
}