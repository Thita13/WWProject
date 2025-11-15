// backend/src/routes/ticketRoutes.js

const express = require('express');
const router = express.Router();
const { getAllTickets, getTicketById, createTicket, getMyTickets, getCommentsForTicket, addComment, deleteTicket } = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');

// เปลี่ยนเส้นทาง GET / ให้ใช้ middleware ด้วย
// (ปกติทุกคนควรดู ticket ได้ แต่ถ้าจะให้ดี เฉพาะคนที่ login แล้วเท่านั้น)
router.get('/', authMiddleware(), getAllTickets);

// (สำคัญ: ต้องอยู่ "ก่อน" /:id เสมอ)
router.get('/my', authMiddleware(), getMyTickets);

// เปลี่ยนเส้นทาง GET /:id ให้ใช้ middleware ด้วย
router.get('/:id', authMiddleware(), getTicketById);

// (สำคัญที่สุด!) เพิ่ม middleware ให้เส้นทาง POST /
// authMiddleware() จะรัน "ยาม" ก่อนที่จะรัน createTicket
router.post('/', authMiddleware(), createTicket);

//ดึง Comments ของ Ticket ตาม ID
router.get('/:id/comments', authMiddleware(), getCommentsForTicket);

// สร้าง Comment ใหม่ สำหรับ Ticket ตาม ID
router.post('/:id/comments', authMiddleware(), addComment);

// ลบ Ticket ตาม ID
router.delete('/:id', authMiddleware(), deleteTicket);

module.exports = router;