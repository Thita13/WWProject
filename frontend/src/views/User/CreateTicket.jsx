// frontend/src/views/User/CreateTicket.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip } from "lucide-react"; // (ยังคงใช้ Paperclip)
import "./CreateTicket.css"; // (ใช้ CSS ของหน้านี้)

// Import Service ที่จำเป็น
import ticketService from "../../services/ticketService";
import authService from "../../services/authService"; 

// Import Header ที่เราสร้าง
import Header from "../../components/Header.jsx"; 

export default function CreateTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "low", // (Default value ควรตรงกับ <option>)
    attachment: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment") {
      setFormData({ ...formData, attachment: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend (ticketController) รับแค่ 3 อย่างนี้ (ณ ตอนนี้)
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
      };
      
      // (ต้องมั่นใจว่า ticketService.js มีฟังก์ชัน createTicket)
      const res = await ticketService.createTicket(payload); 
      
      console.log('Ticket created', res);
      alert('สร้าง Ticket สำเร็จ');
      navigate('/dashboard'); // (เด้งกลับไปหน้า Dashboard หลัก)
    } catch (err) {
      console.error('Failed to create ticket', err);
      alert('สร้าง Ticket ไม่สำเร็จ (กรุณาเช็ค Backend/Service)');
    }
  };

  // ฟังก์ชัน Logout
  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="user-create-page">
      {/* ============ Sidebar ============ */}
      <div className="sidebar">
        <div className="brand">
          <div className="brand-title">Support Ticket</div>
        </div>

        <nav>
          <div className="nav-item" onClick={() => navigate("/dashboard")}>Dashboard </div>
          <div className="nav-item active">Create Ticket</div>
        </nav>

        <div className="logout">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* ============ Main Content ============ */}
      <div className="main">
        
        {/* (สำคัญ!) ใช้ Header Component ตัวใหม่ */}
        <Header />

        {/* Content */}
        <div className="content">
          <h1 className="page-title">Create Ticket</h1>

          <form className="ticket-form" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <h2>Ticket Information</h2>
              <label>Title / หัวข้อปัญหา *</label>
              <input
                type="text"
                required
                name="title"
                placeholder="เช่น: เปิดคอมไม่ติด"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description / รายละเอียด *</label>
              <textarea
                rows="5"
                required
                name="description"
                placeholder="ระบุรายละเอียดปัญหา"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Priority (แก้ value ให้เป็นตัวพิมพ์เล็ก ตรงกับ DB) */}
            <div className="form-group">
              <label>Priority / ความสำคัญ *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low (ต่ำ)</option>
                <option value="medium">Medium (ปานกลาง)</option>
                <option value="high">High (สูง)</option>
                <option value="urgent">Urgent (วิกฤต)</option>
              </select>
            </div>

            {/* Attachment (Disabled) */}
            <div className="form-group">
              <label>Attachment / แนบไฟล์</label>
              <div className="file-box">
                <input
                  type="file"
                  name="attachment"
                  onChange={handleChange}
                  disabled 
                />
              </div>
            </div>

            {/* Submit */}
            <div className="submit-section">
              <button type="submit" className="submit-btn">
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}