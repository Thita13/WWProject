import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. (สำคัญ!) Import authService.js ที่เราเพิ่งสร้าง
import authService from '../services/authService.js';

// 2. Import CSS (เช็คให้ชัวร์ว่าชื่อไฟล์ CSS ถูกต้อง)
import './Login.css'; 

function LoginPage() {
    // 3. (สำคัญ!) เปลี่ยน State จาก email เป็น nameUser
    const [nameUser, setNameUser] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); 
        try {
            //  ต้องรับ "user" ที่มี role กลับมา
            const user = await authService.login(nameUser, password);
            
            console.log('Login สำเร็จ, Role:', user.role); // ⬅️ คุณจะเห็น Role ใน Console
            
            //  ใช้ switch-case เพื่อส่ง user ไปถูกที่
            //    (ใช้ Path ตัวพิมพ์เล็ก ให้ตรงกับ App.jsx)
            switch (user.role) {
              case 'admin':
                navigate('/admin'); // ⬅️ ไปที่ /admin
                break;
              case 'staff':
                navigate('/staff'); // ⬅️ ไปที่ /staff
                break;
              case 'user':
                navigate('/dashboard'); // ⬅️ ไปที่ /dashboard (d เล็ก)
                break;
              default:
                navigate('/dashboard'); // ⬅️ หน้า Default
            }

        } catch (error) {
            console.error('Login ล้มเหลว:', error);
            let message = 'ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง';
            if (error.response && error.response.data && error.response.data.message) {
                message = error.response.data.message;
            }
            alert(message);
        }
    };

    return (
        <div className="login-container"> 
            <div className="login-form-card">
                
                <div className="login-image-header">
                    <img src="https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg" alt="Support Ticket Header" />
                </div>

                <div className="login-content">
                    <h2>Support Ticket</h2>
                    <p>Login</p>

                    <form onSubmit={handleLogin}>
                        {/* 6. (สำคัญ!) แก้ไขช่อง Input ทั้งหมด */}
                        <div className="input-group">
                            <input 
                                type="text"
                                placeholder="Username"
                                value={nameUser}
                                onChange={(e) => setNameUser(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <input 
                                type="password"
                                placeholder="Password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required
                            />
                        </div>

                        <button type="submit" className="login-button">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;