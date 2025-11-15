// frontend/src/services/authService.js

import api from './api.js';
import { jwtDecode } from 'jwt-decode'; // ตัวถอดรหัส Token

// ฟังก์ชันสำหรับ Login (อัปเดต)
const login = async (name_user, password) => {
  const response = await api.post('/auth/login', {
    name_user,
    password,
  });
  
  if (response.data.token) {
    const token = response.data.token;
    
    // (สำคัญ!) ถอดรหัส token เพื่อเอา Role
    const user = jwtDecode(token); 

    // (อัปเดต!) เก็บ cả token และ ข้อมูล user
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user)); // เก็บเป็น JSON string

    // (สำคัญ!) ส่ง "user" (ที่มี role) กลับไปให้ Login.jsx
    return user; 
  }
  
  return null; // ถ้าไม่สำเร็จ ให้ส่ง null
};

// ฟังก์ชันสำหรับ Logout (อัปเดต)
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user'); // ลบ user ออกด้วย
};

// ฟังก์ชันสำหรับดึงข้อมูล user ปัจจุบัน (สำหรับ ProtectedRoute)
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  return JSON.parse(userStr);
};

// ฟังก์ชันสำหรับ Register
const register = async (name_user, password, role) => {
  const response = await api.post('/auth/register', {
    name_user,
    password,
    role: role || 'user',
  });
  
  if (response.data.token) {
    // (ถ้าอยากให้ Register แล้ว Login เลย ก็ทำเหมือน Login)
    const token = response.data.token;
    const user = jwtDecode(token); 
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  return null;
};

// (สำคัญ!) นี่คือบรรทัดที่พัง
// ต้องมี "export default" แค่ "อันเดียว"
export default {
  login,
  register,
  logout,
  getCurrentUser,
};