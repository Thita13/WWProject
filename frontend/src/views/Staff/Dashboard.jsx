// frontend/src/views/Staff/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Staff/Dashboard.css";
import ticketService from "../../services/ticketService.js";
import authService from "../../services/authService.js";
import Header from "../../components/Header.jsx";

export default function StaffDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. เช็ค Login
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
    }

    const fetchTickets = async () => {
      try {
        // 2. (สำคัญ!) แก้ไขจุดที่ 1: Staff ดึง "Ticket ทั้งหมด"
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
    <div className="user-dashboard-page"> {/* (ใช้ Class เดียวกัน) */}
      {/* ============ Sidebar ============ */}
      <div className="sidebar">
        <div className="brand">
          <div className="brand-title">Support Ticket</div>
        </div>
        <nav>
            {/* 3. เมนู */}
          <div className="nav-item active"> Dashboard</div>
          <div className="nav-item" onClick={() => navigate("/staff/assigned")}>
             My Assigned
          </div>
        </nav>
        <div className="logout">
          <button className="logout-btn" onClick={handleLogout}> Logout</button>
        </div>
      </div>

      {/* ============ Main Content ============ */}
      <div className="main">
        <Header />

        <div className="content">
          <h1 className="page-title">All Tickets</h1>
          
          {/* Summary Cards (เหมือนเดิม) */}
          <div className="summary-cards">
            <div className="card card-open">
                <div className="card-title">Open</div>
                <div className="card-number">{totalOpen}</div>
            </div>

            <div className="card card-progress">
                <div className="card-title">In Progress</div>
                <div className="card-number">{totalInProgress}</div>
            </div>

            <div className="card card-closed">
                <div className="card-title">Closed</div>
                <div className="card-number">{totalClosed}</div>
            </div>
          </div>

          {/* Ticket Table (เหมือนเดิม) */}
          <div className="ticket-table-section">
            <h2 className="table-title">All Tickets</h2>
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ผู้สร้าง</th>
                  <th>หัวข้อ</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* (Map ข้อมูล "tickets" ที่ดึงมา) */}
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
                      <button className="view-btn"onClick={() => navigate(`/staff/ticket/${t.id}`)}>
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