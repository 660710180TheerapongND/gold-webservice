import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // 🔑 เปลี่ยนมาเช็กจาก 'token' (JWT) แทน gt_api_key
  const token = localStorage.getItem('token');
  const location = useLocation();

  // 🚀 ตรวจสอบว่ามี Token จริงๆ และไม่ใช่ค่าขยะอย่าง 'undefined'
  const isAuthenticated = token && token !== 'undefined';

  if (!isAuthenticated) {
    // 🚩 ถ้าไม่มี Token (ยังไม่ได้ Login) ให้ดีดกลับไปหน้า Login ทันที
    // และเก็บที่อยู่ปัจจุบัน (from) ไว้เพื่อให้พอ Login เสร็จ ระบบจะพาวิ่งกลับมาหน้าเดิมให้อัตโนมัติ
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ ถ้ามี Token แล้ว ก็อนุญาตให้เข้าไปดูเนื้อหาข้างใน (เช่น Dashboard) ได้เลยครับ
  return children;
};

export default ProtectedRoute;