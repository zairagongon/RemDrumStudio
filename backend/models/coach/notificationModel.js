const pool = require('../../config/db');

function formatTimeAgo(dateVal) {
  const diffMs = Date.now() - new Date(dateVal).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

async function getNotifications(coachId) {
  const [rows] = await pool.query(
    `SELECT id, title, message, type, action_tab, action_label, is_unread, created_at
     FROM coach_notifications
     WHERE coach_id = ?
     ORDER BY created_at DESC, id DESC`,
    [coachId]
  );

  return rows.map(row => ({
    id: String(row.id),
    title: row.title,
    message: row.message,
    type: row.type,
    time: formatTimeAgo(row.created_at),
    unread: Boolean(row.is_unread),
    actionTab: row.action_tab,
    actionLabel: row.action_label
  }));
}

async function markNotificationRead(coachId, id) {
  const [result] = await pool.query(
    `UPDATE coach_notifications SET is_unread = 0 WHERE id = ? AND coach_id = ?`,
    [id, coachId]
  );
  return result.affectedRows > 0;
}

async function markAllNotificationsRead(coachId) {
  await pool.query(
    `UPDATE coach_notifications SET is_unread = 0 WHERE coach_id = ?`,
    [coachId]
  );
  return getNotifications(coachId);
}

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};