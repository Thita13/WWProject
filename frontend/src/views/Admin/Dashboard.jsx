// frontend/src/views/Admin/Dashboard.jsx
// (นี่คือโค้ดของคุณ ที่ "อัปเกรด" Sidebar แล้ว)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// (สำคัญ!) เราจะใช้ CSS หลัก (Dashboard) ร่วมกัน
import "../User/Dashboard.css"; 
import ticketService from "../../services/ticketService.js";
import authService from "../../services/authService.js";
import Header from "../../components/Header.jsx";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
    }

    const fetchTickets = async () => {
      try {
        const data = await ticketService.getAllTickets(); 
        setTickets(data);
        setLoading(false);
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูล Ticket ได้");
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);

  // (การคำนวณสรุป, Logout ➜ เหมือนเดิม)
  const totalOpen = tickets.filter((t) => t.status === "open").length;
  const totalInProgress = tickets.filter((t) => t.status === "in_progress").length;
  const totalClosed = tickets.filter((t) => t.status === "closed").length;

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (loading) return <div className="loading-fullpage">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="error-fullpage">{error}</div>;

  return (
    <div className="user-dashboard-page"> 
      {/* ============ (แก้ไข!) Sidebar ============ */}
      <div className="sidebar">
        <div className="brand">
          <div className="brand-title">Support Ticket</div>
        </div>
        <nav>
          {/* (เมนูของ Admin) */}
          <div className="nav-item active">Dashboard</div>
        </nav>
        <div className="logout">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* ============ Main Content (เหมือนเดิม) ============ */}
      <div className="main">
        <Header />

        <div className="content">
          <h1 className="page-title">All Tickets</h1>
          
          {/* Summary Cards (เหมือนเดิม) */}
          <div className="summary-cards">
            {/* ... (โค้ด Card 3 ใบ ➜ เหมือนเดิม) ... */}
          </div>

          {/* Ticket Table (เหมือนเดิม) */}
          <div className="ticket-table-section">
            <h2 className="table-title">All Tickets</h2>
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.created_by}</td>
                    <td>{t.title}</td>
                    <td>{t.priority}</td>
                    <td>
                      <span className={`badge ${t.status.replace("_", "")}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>{new Date(t.created_at).toLocaleDateString()}</td>
                    <td>
                      {/* (ปุ่ม Detail ➜ ชี้ไปที่ Path ของ Admin (ถูกต้อง)) */}
                      <button className="view-btn" onClick={() => navigate(`/admin/ticket/${t.id}`)}>
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}