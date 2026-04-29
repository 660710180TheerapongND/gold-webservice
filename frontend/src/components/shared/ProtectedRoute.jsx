import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // เช็กว่ามี API Key ในเครื่องไหม (บัตรผ่านที่เราได้จากมิ้นตอน Login)
  const isAuthenticated = localStorage.getItem('gt_api_key');
  const location = useLocation();

  if (!isAuthenticated) {
    // ถ้าไม่มีบัตร ให้ดีดกลับไปหน้า Login 
    // และแถม state "from" ไว้ด้วย เพื่อที่พอ Login เสร็จ จะได้เด้งกลับมาหน้านี้ถูก
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ถ้ามีบัตร ก็ปล่อยให้เข้าไปดูเนื้อหาข้างในได้
  return children;
};

export default ProtectedRoute;