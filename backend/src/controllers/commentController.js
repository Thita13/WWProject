// commentController.js
const db = require('../config/db');

// GET /api/comments/:ticketId - ดึง comment ของ ticket
const getCommentsByTicket = async (req, res) => {
  const { ticketId } = req.params;
  try {
    const [rows] = await db.query('SELECT c.*, u.name_user FROM comment c JOIN users u ON c.user_id = u.id WHERE c.ticket_id = ? ORDER BY c.created_at ASC', 
      [ticketId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/comments - สร้าง comment ใหม่
const createComment = async (req, res) => {
  const { message, ticket_id} = req.body;
  const userIdFromToken = req.user.id; //ดึง user id จาก Token (ที่ middleware ส่งมา)
  try {
    const [result] = await db.query(
      'INSERT INTO comment (message, ticket_id, user_id, created_at) VALUES (?, ?, ?, NOW())',
      [message, ticket_id, userIdFromToken]
    );

    // 4. ส่ง Comment ใหม่ที่เพิ่งสร้าง (พร้อมชื่อ user) กลับไป
    const [newComment] = await db.query(
      'SELECT c.*, u.name_user FROM comment c JOIN users u ON c.user_id = u.id WHERE c.id = ?', 
      [result.insertId]
    );


    res.status(201).json({ message: 'Comment created', commentId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCommentsByTicket, createComment };
