// commentRoutes.js
const express = require('express');
const router = express.Router();
const { getCommentsByTicket, createComment } = require('../controllers/commentController');
// 1.Import middleware
const authMiddleware = require('../middleware/authMiddleware');

// 2.เพิ่ม middleware ให้เส้นทาง GET ด้วย
// (มีแค่คนที่ login แล้ว ถึงจะอ่าน comment ได้)
router.get('/:ticketId', authMiddleware(), getCommentsByTicket);
// 3.เพิ่ม middleware ให้เส้นทาง POST
router.post('/', authMiddleware(), createComment);
// สร้าง comment ใหม่
router.post('/', createComment);

module.exports = router;
