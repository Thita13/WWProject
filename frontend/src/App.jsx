// frontend/src/App.jsx
import React from 'react';
// 1. Import เครื่องมือ Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 2. Import หน้าหลัก (ตามโครงสร้างไฟล์ของคุณ)
import LoginPage from './views/Login.jsx';
import UserDashboard from './views/User/Dashboard.jsx';
import StaffDashboard from './views/Staff/Dashboard.jsx';
import AdminDashboard from './views/Admin/Dashboard.jsx';
import CreateTicketPage from './views/User/CreateTicket.jsx';
import ViewTicketPage from './views/User/TicketDetail.jsx';
// 3. Import "ยาม" (เช็ค Path ให้ถูกต้อง, ปกติจะอยู่ที่ './components/ProtectedRoute.jsx')
import ProtectedRoute from './components/ProtectedRoute.jsx'; 


const UnauthorizedPage = () => <h2>403 - คุณไม่ได้รับอนุญาตให้เข้าหน้านี้</h2>;


// นี่คือส่วน function App ที่คุณถามถึง
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ======================================= */}
        {/* == 1. Public Routes (ใครก็เข้าได้) == */}
        {/* ======================================= */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ======================================= */}
        {/* == 2. Protected Routes (ต้อง Login) == */}
        {/* ======================================= */}

        {/* --- หน้า User --- */}
        {/* "ยาม" จะเฝ้า Path ทั้งหมดที่อยู่ข้างในนี้ */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'staff', 'admin']} />}>
          <Route path="/dashboard" element={<UserDashboard />} /> 
          <Route path="/user/create" element={<CreateTicketPage />} />
          <Route path="/user/ticket/:id" element={<ViewTicketPage />} />
        </Route>

        {/* --- หน้า Staff --- */}
        <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
          <Route path="/staff" element={<StaffDashboard />} />
        </Route>

        {/* --- หน้า Admin --- */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* --- 404 Not Found --- */}
        {/* ถ้าพิมพ์ URL มั่วๆ มา ให้เด้งกลับไปหน้าแรก */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;