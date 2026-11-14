const db = require('../../config/db');

const COLUMNS = 'id, first_name, last_name, email, password_hash, role, is_active, must_change_password, password_set_at';

exports.findByEmail = async email => {
  const [rows] = await db.execute(`SELECT ${COLUMNS} FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows[0] || null;
};

exports.findById = async id => {
  const [rows] = await db.execute(`SELECT ${COLUMNS} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

// Normal sign-up: the person chose their password right now
exports.create = async ({ firstName, lastName, email, passwordHash, role, phone = null }) => {
  const [result] = await db.execute(
    'INSERT INTO users (first_name, last_name, email, password_hash, role, phone, password_set_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [firstName, lastName, email, passwordHash, role, phone]
  );
  return result.insertId;
};

// Invited account (coach): no password chosen yet
exports.createInvited = async ({ firstName, lastName, email, passwordHash, role }) => {
  const [result] = await db.execute(
    'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [firstName, lastName, email, passwordHash, role]
  );
  return result.insertId;
};

exports.setPassword = async (id, passwordHash) => {
  await db.execute('UPDATE users SET password_hash = ?, password_set_at = NOW(), must_change_password = 0 WHERE id = ?', [passwordHash, id]);
};

// How many active people of each role there are
exports.countByRole = async () => {
  const [rows] = await db.execute('SELECT role, COUNT(*) AS total FROM users WHERE is_active = 1 GROUP BY role');
  return Object.fromEntries(rows.map(r => [r.role, Number(r.total)]));
};