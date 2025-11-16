const db = require('../config/db');

// GET /api/tickets - ดึง ticket ทั้งหมด
const getAllTickets = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id, t.title, t.description, t.priority, t.status, 
             t.assigned_to_id,  /* 1. (แก้ไข!) ต้องเป็น _id */
             t.created_at, t.updated_at, 
             u.name_user AS created_by
      FROM ticket t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC /* 2. (เพิ่ม!) เรียงตามวันที่ (ใหม่สุดอยู่บน) */`);
   res.json(rows);
  } catch (err) {
   console.error(err);
   res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tickets/:id - ดึง ticket ตาม id
const getTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM ticket WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Ticket not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/tickets - สร้าง ticket ใหม่
const createTicket = async (req, res) => {
  // 1. (แก้ไข!) เอา user_id ออกจาก req.body
  // เราจะไม่เชื่อ user_id ที่ส่งมาจาก body อีกต่อไป
  const { title, description, priority, assigned_to } = req.body;
  
  // 2. (เพิ่มใหม่!) ดึง user id ที่แท้จริงมาจาก Token
  // (authMiddleware เป็นคนถอดรหัส Token แล้วแนบมาให้ใน req.user)
  const userIdFromToken = req.user.id; 

  try {
    const [result] = await db.query(
      'INSERT INTO ticket (title, description, priority, status, assigned_to, user_id, created_at, updated_at) VALUES (?, ?, ?, "open", ?, ?, NOW(), NOW())',
      // 3. (แก้ไข!) ใส่ userIdFromToken ลงไปแทน user_id จาก body
      [title, description, priority || 'medium', assigned_to || null, userIdFromToken]
    );
    
    // 4. (แนะนำ) ส่งข้อมูล ticket ที่สร้างเสร็จกลับไป
    const [newTicket] = await db.query('SELECT * FROM ticket WHERE id = ?', [result.insertId]);
    res.status(201).json(newTicket[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tickets/my - ดึง ticket ของ user ที่ login อยู่
const getMyTickets = async (req, res) => {
  // 1. ดึง id ของ user ที่ login อยู่ (จาก Token)
  const userId = req.user.id;

  try {
    // 2. ค้นหา Ticket เฉพาะของ user คนนี้
    const [rows] = await db.query(
      `SELECT t.id, t.title, t.description, t.priority, t.status, t.created_at, u.name_user AS created_by
       FROM ticket t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = ?`, // ⬅️ (สำคัญ!) กรองด้วย user_id
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// (ฟังก์ชันใหม่!) GET /api/tickets/:id/comments
const getCommentsForTicket = async (req, res) => {
  const { id } = req.params;
  try {
    // (แก้ไข!) เปลี่ยน Query ให้ JOIN ตาราง users
    const [rows] = await db.query(
      `SELECT c.id, c.message, c.ticket_id, c.user_id, c.created_at, 
              u.name_user AS commenter_name, 
              u.role AS commenter_role
       FROM comment c
       JOIN users u ON c.user_id = u.id
       WHERE c.ticket_id = ? 
       ORDER BY c.created_at ASC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/tickets/:id/comments
const addComment = async (req, res) => {
  const { id } = req.params; // ID ของ Ticket
  const { message } = req.body; // เนื้อหา Comment
  const userId = req.user.id; // ID ของคน Comment (จาก Token)

  try {
    const [result] = await db.query(
      'INSERT INTO comment (message, ticket_id, user_id, created_at) VALUES (?, ?, ?, NOW())',
      [message, id, userId]
    );
    
    // (ส่ง Comment ที่เพิ่งสร้างกลับไป)
    const [newComment] = await db.query('SELECT * FROM comment WHERE id = ?', [result.insertId]);
    res.status(201).json(newComment[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/tickets/:id
const deleteTicket = async (req, res) => {
  const { id } = req.params; // ID ของ Ticket
  const userId = req.user.id; // ID ของ User (จาก Token)
  const userRole = req.user.role; // Role ของ User

  try {
    // (ตรรกะการลบ: ถ้าเป็น Admin หรือ เป็นเจ้าของ Ticket ที่ยัง "open")
    let query = 'DELETE FROM ticket WHERE id = ?';
    let params = [id];

    if (userRole !== 'admin') {
      // (ถ้าไม่ใช่ Admin, ต้องเป็นเจ้าของ และ status = open)
      query += ' AND user_id = ? AND status = "open"';
      params.push(userId);
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket not found, not yours, or not open.' });
    }

    // ต้องลบ "Comments" ที่ผูกกันทิ้งด้วย
    await db.query('DELETE FROM comment WHERE ticket_id = ?', [id]);
    
    res.status(200).json({ message: 'Ticket deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/tickets/:id/status - (ฟังก์ชันใหม่!)
const updateTicketStatus = async (req, res) => {
  const { id } = req.params; // ID ของ Ticket
  const { status } = req.body; // สถานะใหม่ (เช่น "in_progress")
  const staffId = req.user.id; // ID ของ Staff ที่กด (จาก Token)

  // (เช็คสิทธิ์) ต้องเป็น Staff หรือ Admin เท่านั้น
  if (req.user.role === 'user') {
    return res.status(403).json({ message: 'Forbidden: Only staff/admin can change status.' });
  }

  try {
    let query = 'UPDATE ticket SET status = ?';
    let params = [status, id];

    // (สำคัญ!) ตรรกะการอัปเดต 3 ขั้นตอนของคุณ
    
    // 1. จาก "open" ➜ "in_progress" (ปุ่ม "รับงาน")
    if (status === 'in_progress') {
      // (สำคัญ!) เมื่อรับงาน ให้ "ผูก" ticket นี้กับ staffId
      // นี่คือหัวใจของ "My Assigned" ในอนาคต
      query += ', assigned_to_id = ? WHERE id = ? AND (status = "open")'; 
      params = [status, staffId, id];
    } 
    // 2. จาก "in_progress" ➜ "resolved" (ปุ่ม "ดำเนินการ")
    else if (status === 'resolved') {
      query += ' WHERE id = ? AND (status = "in_progress")';
    } 
    // 3. จาก "resolved" ➜ "closed" (ปุ่ม "จบงาน")
    else if (status === 'closed') {
      query += ' WHERE id = ? AND (status = "resolved")';
    }
    // (ถ้าสถานะแปลกๆ มา query จะไม่ทำงาน)
    
    const [result] = await db.query(query, params);

    // (เช็คว่าอัปเดตสำเร็จไหม)
    if (result.affectedRows === 0) {
      // (ถ้ากดปุ่มผิดขั้นตอน เช่น กด "จบงาน" ทั้งที่ยังเป็น "open")
      return res.status(400).json({ message: 'Invalid status transition or ticket not found.' });
    }
    
    // (ส่ง Ticket "ตัวใหม่" ที่อัปเดตแล้ว กลับไปให้ Frontend)
    const [updatedTicket] = await db.query('SELECT * FROM ticket WHERE id = ?', [id]);
    res.json(updatedTicket[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tickets/assigned - (ฟังก์ชันใหม่!)
// ดึง Ticket ที่ assigned ให้กับ Staff ที่ login อยู่
const getMyAssignedTickets = async (req, res) => {
  const staffId = req.user.id; // ID ของ Staff ที่ Login (จาก Token)

  // (เช็คสิทธิ์) ต้องเป็น Staff หรือ Admin เท่านั้น
  if (req.user.role === 'user') {
    return res.status(403).json({ message: 'Forbidden: This route is for staff/admin only.' });
  }

  try {
    // (สำคัญ!) ดึง Ticket เฉพาะที่ assigned_to_id (ที่เราเพิ่งสร้าง) ตรงกับ ID ของ Staff
    const [rows] = await db.query(
      'SELECT * FROM ticket WHERE assigned_to_id = ? ORDER BY id ASC',
      [staffId]
    );
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// PATCH /api/tickets/:id/admin - (ฟังก์ชันใหม่!)
// อนุญาตให้ Admin แก้ไข title, priority, description ของ Ticket
const adminUpdateTicket = async (req, res) => {
  const { id } = req.params; // ID ของ Ticket
  // (Admin แก้ได้ 3 อย่าง)
  const { title, priority, description } = req.body; 

  // (เช็คสิทธิ์) ต้องเป็น Admin เท่านั้น
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin only.' });
  }

  // (เช็คว่าส่งข้อมูลมาครบ)
  if (!title || !priority || !description) {
    return res.status(400).json({ message: 'Title, priority, and description are required.' });
  }

  try {
    // (อัปเดต 3 fields ห้ามแตะ status)
    const [result] = await db.query(
      'UPDATE ticket SET title = ?, priority = ?, description = ? WHERE id = ?',
      [title, priority, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }
    
    // (ส่ง Ticket "ตัวใหม่" ที่อัปเดตแล้ว กลับไปให้ Frontend)
    const [updatedTicket] = await db.query('SELECT * FROM ticket WHERE id = ?', [id]);
    res.json(updatedTicket[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  getAllTickets,
  getTicketById,
  createTicket,
  getMyTickets,
  getCommentsForTicket,
  addComment,
  deleteTicket,
  updateTicketStatus,
  getMyAssignedTickets,
  adminUpdateTicket
};