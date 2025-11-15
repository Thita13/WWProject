// src/views/User/Dashboard.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import ticketService from "../../services/ticketService.js";
import authService from "../../services/authService.js";
import Header from "../../components/Header.jsx";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// เช็คว่ามี User Login อยู่หรือไม่
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
    }

    const fetchTickets = async () => {
      try {
        const data = await ticketService.getMyTickets();
        setTickets(data);
        setLoading(false);
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูล Ticket ได้");
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);

  // (คำนวณสรุป)
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
      {/* Sidebar (เหมือนเดิม) */}
      <div className="sidebar">
        {/* ... (Brand, Nav, Logout) ... */}
        <div className="brand">
          <div className="brand-title">Support Ticket</div>
        </div>
        <nav>
          <div className="nav-item active"> Dashboard</div>
          <div className="nav-item" onClick={() => navigate("/user/create")}> Create Ticket</div>
        </nav>
        <div className="logout">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      {/* Main */}
      <div className="main">
        <Header />

        {/* ======================================= */}
        {/* ==  นี่คือโค้ดที่หายไป == */}
        {/* ======================================= */}
        <div className="content">
          <h1 className="page-title">Dashboard</h1>
          
          {/* 1. Summary Cards */}
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

          {/* 2. Ticket Table */}
          <div className="ticket-table-section">
            <h2 className="table-title">My Tickets</h2>
            
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>หัวข้อ</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* 3. (เพิ่ม!) Map ข้อมูลจาก state 'tickets' */}
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.title}</td>
                    <td>{t.priority}</td>
                    <td>
                      <span className={`badge ${t.status.replace("_", "")}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>{new Date(t.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="view-btn"onClick={() => navigate(`/user/ticket/${t.id}`)}>Details</button>
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