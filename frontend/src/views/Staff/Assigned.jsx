// frontend/src/views/Staff/Assigned.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../User/Dashboard.css"; // (ใช้ CSS หลัก)
// (เราจะเพิ่ม CSS ของเพื่อนคุณเข้าไปใน Dashboard.css)
import "../User/Dashboard.css"; // (1. Import CSS หลัก "ของเรา")
import "./Assigned.css";       // (2. Import CSS "ของหน้านี้" ที่เพิ่งสร้าง
import ticketService from "../../services/ticketService.js";
import authService from "../../services/authService.js";
import Header from "../../components/Header.jsx";

// (ฟังก์ชันแปลง Priority (จากโค้ดเพื่อนคุณ))
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent':
      return 'priority-urgent';
    case 'high':
      return 'priority-high';
    case 'medium':
      return 'priority-medium';
    case 'low':
      return 'priority-low';
    default:
      return 'priority-default';
  }
};

export default function StaffAssigned() {
  const navigate = useNavigate();

  // (ดึงข้อมูล "จริง" จาก Backend)
  const [tickets, setTickets] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) navigate("/login");

    const fetchTickets = async () => {
      try {
        const data = await ticketService.getMyAssignedTickets(); 
        setTickets(data);
        setLoading(false);
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูล Ticket (My Assigned) ได้");
        setLoading(false);
      }
    };
    fetchTickets();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (loading) return <div className="loading-fullpage">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="error-fullpage">{error}</div>;

  return (
    // (ใช้ Layout "ของเรา")
    <div className="user-dashboard-page">
      {/* ============ Sidebar (ของเรา) ============ */}
      <div className="sidebar">
        <div className="brand">
          <div className="brand-title">Support Ticket</div>
        </div>
        <nav>
          <div className="nav-item" onClick={() => navigate("/staff")}>
            Dashboard
          </div>
          <div className="nav-item active">
            My Assigned
          </div>
        </nav>
        <div className="logout">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* ============ Main Content (ของเรา) ============ */}
      <div className="main">
        <Header /> 

        {/* (ใช้ "ดีไซน์" ของเพื่อนคุณ) */}
        <div className="content">
          <h1 className="page-title">My Assigned Ticket</h1>

          {/* (นี่คือ Layout "การ์ด" จากโค้ดเพื่อนคุณ) */}
          <div className="tickets-list">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-main-info">
                    <div className="ticket-row">
                      <span className="label">Ticket ID :</span>
                      <span className="value">{ticket.id}</span>
                    </div>
                    <div className="ticket-row">
                      <span className="label">Title :</span>
                      <span className="value">{ticket.title}</span>
                    </div>
                    <div className="ticket-row">
                      <span className="label">Description :</span>
                      <span className="value">{ticket.description}</span>
                    </div>
                    <div className="ticket-row">
                      <span className="label">Status :</span>
                      {/* (เราจะใช้ Badge ของเราแทน) */}
                      <span className={`value badge ${ticket.status.replace("_", "")}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <div className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                    Priority : {ticket.priority}
                  </div>
                </div>

                <hr className="divider" />

                <div className="ticket-footer">
                  <div className="ticket-meta">
                    <div className="meta-row">
                      <span className="meta-label">Created At :</span>
                      <span className="meta-value">
                        {new Date(ticket.created_at).toLocaleString()}
                      </span>
                    </div>
                    {/* (เราไม่มี createdBy, email, department) */}
                  </div>
                  <button
                    // (สำคัญ!) แก้ Path ให้ตรงกับ App.jsx
                    onClick={() => navigate(`/staff/ticket/${ticket.id}`)}
                    className="details-btn"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
            
            {/* (ถ้าไม่มี Ticket) */}
            {tickets.length === 0 && (
              <div className="ticket-card">
                <p>คุณยังไม่มี Ticket ที่ "รับงาน" (Assigned) ไว้</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}