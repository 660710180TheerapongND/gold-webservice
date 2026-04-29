import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // 🔑 เช็กว่ามี API Key ในเครื่องไหม (บัตรผ่านที่เราได้มาจากตอน Login สำเร็จ)
  const isAuthenticated = localStorage.getItem('gt_api_key');
  const location = useLocation();

  if (!isAuthenticated) {
    // 🚩 ถ้าไม่มีบัตรผ่าน (ยังไม่ได้ Login) ให้ดีดกลับไปหน้า Login ทันที
    // เราจะแถม "ที่อยู่ปัจจุบัน (from)" ไว้ด้วย เพื่อให้พอ Login เสร็จ ระบบจะพาวิ่งกลับมาหน้าเดิมให้อัตโนมัติ
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ ถ้ามีบัตรผ่านแล้ว (Login แล้ว) ก็อนุญาตให้เข้าไปดูเนื้อหาข้างใน (เช่น Dashboard) ได้เลยครับ
  return children;
};

export default ProtectedRoute;