const db = require('../../config/db');

const SELECT = `SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, u.password_set_at,
  COALESCE(cp.instruments, '') AS instruments, COALESCE(cp.in_band, 0) AS in_band,
  (SELECT t.expires_at FROM invite_tokens t WHERE t.user_id = u.id AND t.used_at IS NULL ORDER BY t.id DESC LIMIT 1) AS invite_expires
  FROM users u LEFT JOIN coach_profiles cp ON cp.user_id = u.id WHERE u.role = 'coach'`;

exports.list = async () => (await db.execute(`${SELECT} ORDER BY u.id`))[0];

exports.findById = async id => (await db.execute(`${SELECT} AND u.id = ? LIMIT 1`, [id]))[0][0] || null;

exports.createProfile = async (userId, instruments, inBand) => {
  await db.execute('INSERT INTO coach_profiles (user_id, instruments, in_band) VALUES (?, ?, ?)', [userId, instruments, inBand ? 1 : 0]);
};

exports.setBand = async (userId, inBand) => {
  await db.execute(
    "INSERT INTO coach_profiles (user_id, instruments, in_band) VALUES (?, '', ?) ON DUPLICATE KEY UPDATE in_band = VALUES(in_band)",
    [userId, inBand ? 1 : 0]
  );
};

exports.setActive = async (userId, active) => {
  await db.execute("UPDATE users SET is_active = ? WHERE id = ? AND role = 'coach'", [active ? 1 : 0, userId]);
};
