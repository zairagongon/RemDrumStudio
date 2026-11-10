const db = require('../config/db');

const COLUMNS = 'id, first_name, last_name, email, password_hash, role, is_active, must_change_password';

exports.findByEmail = async email => {
  const [rows] = await db.execute(`SELECT ${COLUMNS} FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows[0] || null;
};

exports.findById = async id => {
  const [rows] = await db.execute(`SELECT ${COLUMNS} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

exports.create = async ({ firstName, lastName, email, passwordHash, role, phone = null }) => {
  const [result] = await db.execute(
    'INSERT INTO users (first_name, last_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [firstName, lastName, email, passwordHash, role, phone]
  );
  return result.insertId;
};