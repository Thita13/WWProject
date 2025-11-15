// frontend/src/views/User/TicketDetail.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TicketDetail.css"; // (ใช้ CSS ที่คุณส่งมา)

// Import Service และ Component ที่จำเป็น
import ticketService from "../../services/ticketService";
import authService from "../../services/authService";
import Header from "../../components/Header.jsx";

export default function UserTicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // (สำคัญ!) App.jsx ของเราใช้ :id

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]); // (State สำหรับ Comments จริง)
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // (ดึงข้อมูล Ticket และ Comments เมื่อเปิดหน้า)
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true);
        // 1. ดึงข้อมูล Ticket (เราจะสร้างฟังก์ชันนี้)
        const ticketData = await ticketService.getTicketById(id);
        setTicket(ticketData);

        // 2. ดึงข้อมูล Comments (เราจะสร้างฟังก์ชันนี้)
        const commentsData = await ticketService.getCommentsForTicket(id);
        setComments(commentsData);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load ticket data', err);
        alert('ไม่สามารถโหลดข้อมูล Ticket ได้');
        setLoading(false);
      }
    };
    fetchTicketData();
  }, [id]); // (เมื่อ id เปลี่ยน ให้ดึงใหม่)

  // (ส่ง Comment ใหม่)
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const payload = { message: newComment }; // (DB ของคุณใช้ "message")
      
      // (เราจะสร้างฟังก์ชันนี้)
      const addedComment = await ticketService.addComment(id, payload);
      
      // (อัปเดตหน้าจอทันที)
      setComments((prev) => [...prev, addedComment]);
      setNewComment("");
    } catch (err) {
      console.error('Failed to add comment', err);
      alert('ไม่สามารถส่งคอมเมนต์ได้ (กรุณาเช็ค Backend)');
    }
  };

  // (ลบ Ticket)
  const handleDelete = async () => {
    if (!ticket) return;
    if (ticket.status !== "open") { // (แก้ Status ให้ตรงกับ DB)
      alert("ลบไม่ได้ เพราะ Ticket ไม่ได้อยู่ในสถานะ Open");
      return;
    }
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Ticket นี้?")) {
      try {
        // (เราจะสร้างฟังก์ชันนี้)
        await ticketService.deleteTicket(id);
        alert('ลบ Ticket สำเร็จ');
        navigate('/dashboard');
      } catch (err) {
        console.error('Failed to delete ticket', err);
        alert('ลบ Ticket ไม่สำเร็จ (กรุณาเช็ค Backend)');
      }
    }
  };

  // (Logout)
  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="user-ticketdetail-page">
      {/* ============ Sidebar ============ */}
      <div className="sidebar">
        <div className="brand">
          <div className="brand-title">Support Ticket</div>
        </div>
        <nav>
          <div className="nav-item" onClick={() => navigate("/dashboard")}>
             Dashboard
          </div>
          <div className="nav-item" onClick={() => navigate("/user/create")}>
             Create Ticket
          </div>
          <div className="nav-item active"> Ticket Detail</div>
        </nav>
        <div className="logout">
          <button className="logout-btn" onClick={handleLogout}> Logout</button>
        </div>
      </div>

      {/* ============ Main Content ============ */}
      <div className="main">
        
        {/* (ใช้ Header ตัวใหม่) */}
        <Header />

        {/* Content */}
        <div className="content">
          <h1 className="page-title">Ticket Detail (ID: {id})</h1>

          {loading && <div>Loading ticket...</div>}
          {!loading && !ticket && <div>Ticket not found.</div>}

          {/* (ถ้ามี ticket แล้วค่อยแสดงผล) */}
          {ticket && (
            <>
              {/* Ticket Info Card (ลบ Department ออก) */}
              <div className="ticket-info-card">
                <div className="info-row">
                  <strong>Title:</strong>
                  <span>{ticket.title}</span>
                </div>
                <div className="info-row">
                  <strong>Priority:</strong>
                  <span>{ticket.priority}</span>
                </div>
                <div className="info-row">
                  <strong>Status:</strong>
                  <span className={`badge ${ticket.status.replace("_", "")}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="info-row">
                  <strong>Description:</strong>
                  <p className="desc">{ticket.description}</p>
                </div>
                <div className="info-row">
                  <strong>Created:</strong>
                  <span>{new Date(ticket.created_at).toLocaleString()}</span>
                </div>
                <div className="action-btns">
                  <button
                    className="delete-btn"
                    disabled={ticket.status !== "open"}
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Comment Section (เชื่อมต่อของจริง) */}
              <div className="comment-section">
                <h2>Comments</h2>
                <div className="comment-list">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className={`comment-item ${
                        c.user_id === authService.getCurrentUser().id ? "me" : "staff"
                      }`}
                    >
                      <div className="comment-sender">
                        {c.commenter_name}
                      </div>

                      <div className="comment-text">{c.message}</div>
                      <div className="comment-time">{new Date(c.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                  {comments.length === 0 && <div className="comment-item">No comments yet.</div>}
                </div>
                {/* Add Comment */}
                <div className="comment-input-box">
                  <textarea
                    rows="3"
                    placeholder="พิมพ์ข้อความ..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>
                  <button className="send-btn" onClick={handleAddComment}>
                    ส่งข้อความ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}