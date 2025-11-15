// frontend/src/App.jsx
import React from 'react'
// 1. (เพิ่ม!) Import BrowserRouter มาที่นี่
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// 2. Import หน้าต่างๆ ของคุณ
import LoginPage from './views/Login.jsx'
import UserDashboard from './views/User/Dashboard.jsx';
import StaffDashboard from './views/Staff/Dashboard.jsx';
import AdminDashboard from './views/Admin/Dashboard.jsx';
// ฯลฯ

function App() {
  return (
    // 3. (สำคัญ!) หุ้ม <Routes> ด้วย <BrowserRouter> ที่นี่
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* ... (Route อื่นๆ ของคุณ) ... */}
      </Routes>
    </BrowserRouter>
  )
}

export default App