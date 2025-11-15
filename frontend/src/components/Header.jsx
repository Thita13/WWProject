// frontend/src/components/Header.jsx

import React, { useState, useEffect } from 'react';
// 1. (เพิ่ม!) Import authService เพื่อดึงข้อมูล User
import authService from '../services/authService.js';
import './Header.css'; // 2. Import CSS

function Header() {
  const [currentUser, setCurrentUser] = useState(null);

  // 3. ดึงข้อมูล User จาก localStorage เมื่อ Component โหลด
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []); // [] = ทำงานแค่ครั้งเดียว

  return (
    <div className="header">
      {/* 4. ส่วนด้านซ้าย (ตอนนี้ว่างเปล่า เพราะลบ Search Bar ออก) */}
      <div className="header-left">
        {/* No Search Bar */}
      </div>

      {/* 5. (สำคัญ!) ส่วนด้านขวา (Profile)
          (เหมือนในรูป image_3f4dc0.png และ image_3e7120.png)
      */}
      <div className="header-right">
        <div className="user-profile">
          <div className="avatar">
            {/* ใช้อักษรตัวแรกของชื่อ */}
            {currentUser?.name_user ? currentUser.name_user[0].toUpperCase() : 'A'}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser?.name_user || 'User'}</div>
            {/* (เราจะแสดง Role แทน Email นะครับ) */}
            <div className="user-role">{currentUser?.role || 'Role'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;