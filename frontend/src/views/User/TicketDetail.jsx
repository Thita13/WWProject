// frontend/src/views/User/TicketDetail.jsx
// (อัปเกรด! ➜ เพิ่ม Modal และปุ่ม Admin)

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Dashboard.css"; 
import "./TicketDetail.css"; 
import ticketService from "../../services/ticketService";
import authService from "../../services/authService";
import Header from "../../components/Header.jsx";

export default function UserTicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  // (State เดิม ➜ เหมือนเดิม)
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); 

  // ⬇️ ⬇️ ⬇️ (เพิ่ม State ใหม่!) ⬇️ ⬇️ ⬇️
  // (State สำหรับ Modal "แก้ไข" ของ Admin)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    priority: 'low',
    description: ''
  });

  useEffect(() => {
    // 4. (เพิ่ม!) ดึงข้อมูล User ที่ Login
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      navigate('/login'); // ถ้าไม่มี user, เด้งกลับ
    }

    const fetchTicketData = async () => {
      try {
        setLoading(true);
        const ticketData = await ticketService.getTicketById(id);
        const commentsData = await ticketService.getCommentsForTicket(id);
        setTicket(ticketData);
        setComments(commentsData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load ticket data', err);
        setLoading(false);
      }
    };
    
    if (user) {
      fetchTicketData();
    }
  }, [id, navigate]);

  // (handleAddComment, handleLogout, handleUpdateStatus ➜ เหมือนเดิม)
  const handleAddComment = async () => { /* ... (โค้ดเดิม) ... */ };
  const handleLogout = () => { /* ... (โค้ดเดิม) ... */ };
  const handleUpdateStatus = async (newStatus) => { /* ... (โค้ดเดิม) ... */ };

  // (อัปเกรด!) "ฟังก์ชันลบ" (ฉลาด) ➜ ใช้ได้ทั้ง User และ Admin
  const handleDelete = async () => {
    if (!ticket) return;
    
    let confirmMessage = "";
    
    // (ตรรกะของ Admin)
    if (currentUser.role === 'admin') {
      confirmMessage = "ADMIN: คุณแน่ใจหรือไม่ว่าต้องการลบ Ticket นี้ถาวร?";
    } 
    // (ตรรกะของ User)
    else if (currentUser.role === 'user' && ticket.user_id === currentUser.id) {
      if (ticket.status !== "open") {
        alert("ลบไม่ได้ เพราะ Ticket ไม่ได้อยู่ในสถานะ Open");
        return;
      }
      confirmMessage = "คุณแน่ใจหรือไม่ว่าต้องการลบ Ticket นี้?";
    } else {
      // (Staff กดปุ่ม Delete ไม่ได้ ➜ เพราะปุ่มไม่โผล่)
      return; 
    }

    if (window.confirm(confirmMessage)) {
      try {
        await ticketService.deleteTicket(id);
        alert('Ticket deleted successfully');
        
        // (เด้งกลับบ้านตาม Role)
        if (currentUser.role === 'admin') navigate('/admin');
        else if (currentUser.role === 'staff') navigate('/staff');
        else navigate('/dashboard');

      } catch (err) {
        console.error('Failed to delete ticket', err);
        alert('Failed to delete ticket');
      }
    }
  };

  // ⬇️ ⬇️ ⬇️ (เพิ่มฟังก์ชันใหม่! ➜ สำหรับ Modal) ⬇️ ⬇️ ⬇️
  const handleOpenEditModal = () => {
    if (!ticket) return;
    // (ดึงข้อมูล "ปัจจุบัน" ของ Ticket มาใส่ใน Form)
    setFormData({
      title: ticket.title,
      priority: ticket.priority,
      description: ticket.description,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // (ฟังก์ชัน "ส่ง" Form ที่แก้ไข)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // (เรียก Service ใหม่ของ Admin)
      const updatedTicket = await ticketService.adminUpdateTicket(id, formData);
      setTicket(updatedTicket); // (อัปเดตหน้าจอ)
      handleCloseEditModal(); // (ปิด Modal)
      alert('Ticket updated successfully!');
    } catch (err) {
      console.error('Failed to update ticket', err);
      alert('Error updating ticket. (เช็ค Backend/Service)');
    }
  };


  return (
    <div className="user-ticketdetail-page">
      {/* ============ Sidebar (ฉลาด) ➜ เหมือนเดิม ============ */}
      <div className="sidebar">
        <div className="brand">
          <div className="brand-title">Support Ticket</div>
        </div>

        {/* --- เมนู User --- */}
        {currentUser && currentUser.role === 'user' && (
          <nav>
            <div className="nav-item" onClick={() => navigate("/dashboard")}>Dashboard</div>
            <div className="nav-item" onClick={() => navigate("/user/create")}>Create Ticket</div>
            <div className="nav-item active">Ticket Detail</div>
          </nav>
        )}

        {/* --- เมนู Staff --- */}
        {currentUser && currentUser.role === 'staff' && (
          <nav>
            <div className="nav-item" onClick={() => navigate("/staff")}>Dashboard (All)</div>
            <div className="nav-item" onClick={() => navigate("/staff/assigned")}>My Assigned</div>
            <div className="nav-item active">Ticket Detail</div>
          </nav>
        )}

        {/* --- (เพิ่ม!) เมนู Admin --- */}
        {currentUser && currentUser.role === 'admin' && (
          <nav>
            <div className="nav-item" onClick={() => navigate("/admin")}>Dashboard</div>
            <div className="nav-item active">Ticket Detail</div>
          </nav>
        )}

        <div className="logout">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* ============ Main Content ============ */}
      <div className="main">
        <Header />
        <div className="content">
          <h1 className="page-title">Ticket Detail (ID: {id})</h1>

          {loading && <div>Loading ticket...</div>}
          {!loading && !ticket && <div>Ticket not found.</div>}

          {ticket && (
            <>
              <div className="ticket-info-card">
                {/* ... (info-row Title, Prio, Status, ...) ... */}
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

                {/* ⬇️ ⬇️ ⬇️ (อัปเกรด!) ⬇️ ⬇️ ⬇️ */}
                {/* (ส่วนปุ่ม Action) */}
                <div className="action-btns">
                  
                  {/* --- 1. ปุ่มสำหรับ Staff (Workflow) --- */}
                  {currentUser && currentUser.role === 'staff' && (
                    <>
                      {/* 1.1 "รับงาน" (Open ➜ In Progress) */}
                      {ticket.status === 'open' && (
                        <button 
                          className="staff-action-btn accept"
                          onClick={() => handleUpdateStatus('in_progress')}
                        >
                          รับงาน
                        </button>
                      )}
                      
                      {/* 1.2 "ดำเนินการ" (In Progress ➜ Resolved) */}
                      {ticket.status === 'in_progress' && (
                        <button 
                          className="staff-action-btn process"
                          onClick={() => handleUpdateStatus('resolved')}
                        >
                          ดำเนินการ (Resolved)
                        </button>
                      )}
                      
                      {/* 1.3 "จบงาน" (Resolved ➜ Closed) */}
                      {ticket.status === 'resolved' && (
                        <button 
                          className="staff-action-btn close-job"
                          onClick={() => handleUpdateStatus('closed')}
                        >
                          จบงาน (Close)
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* --- 2. ปุ่มสำหรับ User (ลบ) --- */}
                  {currentUser && 
                   currentUser.role === 'user' && 
                   ticket.user_id === currentUser.id && (
                    <button
                      className="delete-btn"
                      disabled={ticket.status !== "open"}
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  )}

                  {/* --- 3. (เพิ่ม!) ปุ่มสำหรับ Admin --- */}
                  {currentUser && currentUser.role === 'admin' && (
                    <>
                      {/* (ปุ่ม "แก้ไข" ➜ เปิด Modal) */}
                      <button 
                        className="staff-action-btn edit"
                        onClick={handleOpenEditModal}
                      >
                        Edit Ticket
                      </button>
                      
                      {/* (ปุ่ม "ลบ" ➜ Admin ลบได้ทุกสถานะ) */}
                      <button
                        className="delete-btn"
                        onClick={handleDelete}
                      >
                        Delete Ticket
                      </button>
                    </>
                  )}
                </div>
                {/* ⬆️ ⬆️ ⬆️ (สิ้นสุดการอัปเกรด) ⬆️ ⬆️ ⬆️ */}

              </div> {/* (ปิด .ticket-info-card) */}

              {/* Comment Section ➜ เหมือนเดิม */}
              <div className="comment-section">
                {/* ... (โค้ด Comment ทั้งหมด ➜ เหมือนเดิม) ... */}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ⬇️ ⬇️ ⬇️ (เพิ่ม Modal!) ⬇️ ⬇️ ⬇️ */}
      {/* (Modal "แก้ไข" ของ Admin ➜ จะแสดงเมื่อ isEditModalOpen = true) */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Ticket (ID: {ticket.id})</h2>
            
            {/* (Form สำหรับแก้ไข) */}
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseEditModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ⬆️ ⬆️ ⬆️ (สิ้นสุด Modal) ⬆️ ⬆️ ⬆️ */}

    </div>
  );
}