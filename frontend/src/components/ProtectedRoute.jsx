// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// 1. (สำคัญ!) Import authService (เช็ค Path นี้ให้ดี)
import authService from '../services/authService.js';

// allowedRoles คือ array ของ Role ที่มีสิทธิ์เข้าหน้านี้
const ProtectedRoute = ({ allowedRoles }) => {
  // 2. ดึง user ปัจจุบันจาก localStorage
  const user = authService.getCurrentUser();

  // 3. เช็คว่า Login หรือยัง?
  if (!user) {
    // ถ้ายัง, เด้งกลับไปหน้า Login
    return <Navigate to="/login" replace />;
  }

  // 4. เช็คว่ามีสิทธิ์ (Role) เข้าหน้านี้หรือไม่?
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // ถ้า Role ไม่มีสิทธิ์, เด้งไปหน้า "ไม่ได้รับอนุญาต"
    return <Navigate to="/unauthorized" replace />;
  }

  // 5. ถ้าผ่านหมด: ให้แสดงหน้า Component ลูก (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;