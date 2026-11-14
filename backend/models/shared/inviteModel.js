const crypto = require('crypto');
const db = require('../../config/db');

exports.create = async ({ userId, tokenHash, expiresAt }) => {
  await db.execute('INSERT INTO invite_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [userId, tokenHash, expiresAt]);
};

exports.deleteUnusedForUser = async userId => {
  await db.execute('DELETE FROM invite_tokens WHERE user_id = ? AND used_at IS NULL', [userId]);
};

exports.findByHash = async tokenHash => {
  const [rows] = await db.execute(
    `SELECT t.id, t.user_id, t.expires_at, t.used_at, u.first_name, u.last_name, u.email, u.role, u.is_active
     FROM invite_tokens t JOIN users u ON u.id = t.user_id WHERE t.token_hash = ? LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
};

exports.markUsed = async id => {
  await db.execute('UPDATE invite_tokens SET used_at = NOW() WHERE id = ?', [id]);
};

// Only a hash of the link token is stored, so a database leak can't reveal working links
exports.hashToken = token => crypto.createHash('sha256').update(token).digest('hex');
