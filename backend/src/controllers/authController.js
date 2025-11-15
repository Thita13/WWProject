// src/controllers/authController.js
const db = require('../config/db');
const { generateToken } = require('../utils/token');

// ---------------------------------------------
// POST /api/auth/register
// ---------------------------------------------
const register = async (req, res) => {
  // 1. ดึงข้อมูลจาก request body
  const { name_user, password, role } = req.body;

  // 2. ตรวจสอบว่าส่งข้อมูลที่จำเป็นมาครบ (กัน error)
  if (!name_user || !password) {
    return res.status(400).json({ message: 'Name and password are required' });
  }

  try {
    // 3. เช็คก่อนว่ามี name_user นี้ในระบบแล้วหรือยัง
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE name_user = ?',
      [name_user]
    );

    // 4. ถ้ามี user ซ้ำ ให้ส่ง error กลับไป
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 5. ถ้าไม่ซ้ำ ให้สร้าง user ใหม่
    // (ถ้า user ไม่ส่ง role มา, DB จะใช้ default 'user' ให้อัตโนมัติ) [อ้างอิงจาก schema.sql]
    const userRole = role || 'user'; // ถ้าส่ง role มาก็ใช้, ไม่ส่งก็ default 'user'

    const [result] = await db.query(
      'INSERT INTO users (name_user, password, role) VALUES (?, ?, ?)',
      [name_user, password, userRole] // ⭐️ ถ้าใช้ bcrypt ให้เปลี่ยน password เป็น hashedPassword
    );

    // 6. ดึง ID ของ user ที่เพิ่งสร้างจากผลลัพธ์ (result.insertId)
    const newUserId = result.insertId;

    // 7. สร้าง Token ให้ user ใหม่ (เพื่อให้ login อัตโนมัติ)
    const token = generateToken({
      id: newUserId,
      role: userRole,
      name_user: name_user
    });

    // 8. ส่ง token กลับไป (สถานะ 201 = Created)
    res.status(201).json({ token });

  } catch (err) {
    // 9. ถ้ามี error จาก DB / server
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ---------------------------------------------
// POST /api/auth/login
// ---------------------------------------------
const login = async (req, res) => {
  const { name_user, password } = req.body;

  try {
    // 1 (แก้ไขแล้ว!) ใช้ 'id' ให้ตรงกับ schema.sql
    // ถ้าคุณใช้ 'id_users' โค้ดจะพังเพราะ "Unknown column 'id_users'"
    const [rows] = await db.query(
      'SELECT id, name_user, password, role FROM users WHERE name_user = ?',
      [name_user]
    );

    // 2 ตรวจสอบว่ามี user ใน DB และ password ตรงไหม
    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3 (แก้ไขแล้ว!) สร้าง JWT token โดยใช้ 'id' (ไม่ใช่ id_users)
    const token = generateToken({
      id: rows[0].id, // map id → id ใน token
      role: rows[0].role, // map role → role ใน token
      name_user: rows[0].name_user // เพิ่ม name_user เข้าไปใน token
    });

    // 4 ส่ง token กลับไป frontend / Postman
    res.json({ token });

  } catch (err) {
    // 5 ถ้ามี error จาก DB / server
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------
// (สำคัญที่สุด!) เพิ่ม register เข้าไปใน exports
// ---------------------------------------------
module.exports = {
  login,
  register // <-- นี่คือส่วนที่แก้ 404 Not Found
};