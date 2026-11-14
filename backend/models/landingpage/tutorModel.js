const db = require('../../config/db');

exports.findAll = async () => {
  const [rows] = await db.execute('SELECT id, name, instrument, bio, image_url FROM tutors ORDER BY id');
  return rows;
};