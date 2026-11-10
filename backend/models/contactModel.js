const db = require('../config/db');

exports.create = async ({ name, email, message }) => {
  const [result] = await db.execute(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
    [name, email, message]
  );
  return result.insertId;
};