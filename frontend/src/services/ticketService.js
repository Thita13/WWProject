// frontend/src/services/ticketService.js

// (สำคัญ!) ไฟล์นี้ต้อง Import "api" (axios) เท่านั้น
// ห้าม Import React Component (เช่น CreateTicket)
import api from './api.js';

const getAllTickets = async () => {
  try {
    const response = await api.get('/tickets');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    throw error; 
  }
};

const getMyTickets = async () => {
  try {
    const response = await api.get('/tickets/my');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch *my* tickets:', error);
    throw error;
  }
};

// (นี่คือฟังก์ชันที่ CreateTicket.jsx เรียกใช้)
const createTicket = async (ticketData) => {
  try {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  } catch (error) {
    console.error('Failed to create ticket:', error);
    throw error;
  }
};

//1.ดึง Ticket ตาม ID
// (Backend มี Route นี้แล้ว /:id)
const getTicketById = async (id) => {
  try {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch ticket ${id}:`, error);
    throw error;
  }
};

//2.เพิ่ม Comment (Backend ยังไม่มี)
const getCommentsForTicket = async (id) => {
  try {
    const response = await api.get(`/tickets/${id}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch comments for ticket ${id}:`, error);
    throw error;
  }
};

//3.ลบ Ticket (Backend ยังไม่มี)
const addComment = async (id, commentData) => {
  try {
    // (Backend ของคุณใช้ "message")
    const response = await api.post(`/tickets/${id}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error(`Failed to add comment:`, error);
    throw error;
  }
};

//4.ลบ Ticket (Backend ยังไม่มี)
const deleteTicket = async (id) => {
  try {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete ticket ${id}:`, error);
    throw error;
  }
};

//5. อัปเดตสถานะ Ticket (Backend ยังไม่มี)
const updateTicketStatus = async (id, newStatus) => {
  try {
    // (ยิงไปที่ PATCH /api/tickets/:id/status ที่เราเพิ่งสร้าง)
    const response = await api.patch(`/tickets/${id}/status`, { status: newStatus });
    return response.data; // (รับ Ticket ที่อัปเดตแล้ว กลับมา)
  } catch (error) {
    console.error(`Failed to update status for ticket ${id}:`, error);
    throw error;
  }
};

// 6. ดึง Ticket ที่ assigned ให้กับ Staff ที่ login อยู่ (Backend ยังไม่มี)
const getMyAssignedTickets = async () => {
  try {
    // (ยิงไปที่ GET /api/tickets/assigned ที่เราเพิ่งสร้าง)
    const response = await api.get('/tickets/assigned');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch assigned tickets:', error);
    throw error;
  }
};

// 7. อนุญาตให้ Admin แก้ไข title, priority, description ของ Ticket
const adminUpdateTicket = async (id, ticketData) => {
  try {
    // (ยิงไปที่ PATCH /api/tickets/:id/admin ที่เราเพิ่งสร้าง)
    // (ticketData คือ { title, priority, description })
    const response = await api.patch(`/tickets/${id}/admin`, ticketData);
    return response.data;
  } catch (error) {
    console.error(`Failed to admin-update ticket ${id}:`, error);
    throw error;
  }
};

// (นี่คือ "export" ที่ถูกต้องเพียง "ที่เดียว")
export default {
  getAllTickets,
  getMyTickets,
  createTicket,
  getTicketById,
  getCommentsForTicket,
  addComment,
  deleteTicket,
  updateTicketStatus,
  getMyAssignedTickets,
  adminUpdateTicket
};