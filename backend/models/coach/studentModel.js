const pool = require('../../config/db');

function formatDate(dateVal) {
  if (!dateVal) return 'TBD';
  return new Date(dateVal).toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });
}

async function findStudents(coachId, { search, filter } = {}) {
  const params = [coachId];
  let whereExtra = '';

  if (search) {
    const like = `%${String(search).trim()}%`;
    whereExtra += ` AND (CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR u.email LIKE ?)`;
    params.push(like, like);
  }

  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.first_name,
       u.last_name,
       u.email,
       COUNT(b.id) AS total_sessions,
       SUM(CASE WHEN b.category = 'completed' THEN 1 ELSE 0 END) AS attended_sessions,
       SUM(CASE WHEN b.category = 'in-progress' THEN 1 ELSE 0 END) AS active_sessions,
       MIN(CASE WHEN b.category != 'completed' THEN b.session_date ELSE NULL END) AS next_date,
       MAX(b.session_date) AS latest_date,
       SUBSTRING_INDEX(GROUP_CONCAT(b.time_range ORDER BY b.session_date DESC), ',', 1) AS next_time,
       MAX(b.lesson_type) AS instrument,
       SUM(CASE WHEN b.payment_status = 'Unpaid' THEN 1 ELSE 0 END) AS unpaid_count
     FROM lesson_bookings b
     JOIN users u ON u.id = b.student_id
     WHERE b.coach_id = ? ${whereExtra}
     GROUP BY u.id, u.first_name, u.last_name, u.email
     ORDER BY u.first_name ASC`,
    params
  );

  let students = rows.map(row => {
    const name = `${row.first_name} ${row.last_name}`.trim();
    const initials = `${row.first_name?.[0] || ''}${row.last_name?.[0] || ''}`.toUpperCase() || 'ST';
    const status = Number(row.active_sessions) > 0 ? 'Active' : 'Completed';
    const paymentStatus = Number(row.unpaid_count) > 0 ? 'Unpaid' : 'Paid';

    return {
      id: String(row.id),
      initials,
      name,
      email: row.email,
      nextLessonDate: formatDate(row.next_date || row.latest_date),
      nextLessonTime: row.next_time || 'TBD',
      status,
      paymentStatus,
      phone: row.phone || 'Not provided',
      guardian: row.guardian || 'Parent/Guardian',
      instrument: row.instrument || 'Drum Lesson',
      progress: `${row.attended_sessions || 0} completed sessions`,
      attendedSessions: Number(row.attended_sessions || 0)
    };
  });

  if (filter && filter !== 'All Students') {
    students = students.filter(st => st.status.toLowerCase() === String(filter).toLowerCase());
  }

  return students;
}

module.exports = {
  findStudents
};