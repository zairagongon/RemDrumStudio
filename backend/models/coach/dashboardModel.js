const pool = require('../../config/db');

function formatDate(dateVal) {
  return new Date(dateVal).toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });
}

async function getDashboardData(coachId) {
  const [[coachRow]] = await pool.query(
    `SELECT id, first_name, last_name, email, role
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [coachId]
  );

  const [[counts]] = await pool.query(
    `SELECT
       SUM(CASE WHEN DATE(session_date) = CURDATE() THEN 1 ELSE 0 END) AS todayLessons,
       SUM(CASE WHEN DATE(session_date) > CURDATE() AND category = 'in-progress' THEN 1 ELSE 0 END) AS upcomingLessons,
       COUNT(DISTINCT student_id) AS myStudents,
       SUM(CASE WHEN category = 'rescheduled' OR status IN ('Pending', 'Pending Reschedule') THEN 1 ELSE 0 END) AS pendingConfirmation
     FROM lesson_bookings
     WHERE coach_id = ?`,
    [coachId]
  );

  const [[override]] = await pool.query(
    `SELECT today_lessons, upcoming_lessons, my_students, pending_confirmation
     FROM coach_overview_overrides
     WHERE coach_id = ?
     LIMIT 1`,
    [coachId]
  );

  const [todayRows] = await pool.query(
    `SELECT
       b.id,
       b.session_date,
       b.time_range,
       b.lesson_type,
       b.status,
       b.payment_status,
       CONCAT(u.first_name, ' ', u.last_name) AS student_name
     FROM lesson_bookings b
     JOIN users u ON u.id = b.student_id
     WHERE b.coach_id = ? AND DATE(b.session_date) = CURDATE()
     ORDER BY b.session_date ASC, b.id ASC`,
    [coachId]
  );

  const [upcomingRows] = await pool.query(
    `SELECT
       b.id,
       b.session_date,
       b.time_range,
       b.lesson_type,
       b.status,
       b.payment_status,
       CONCAT(u.first_name, ' ', u.last_name) AS student_name
     FROM lesson_bookings b
     JOIN users u ON u.id = b.student_id
     WHERE b.coach_id = ? AND b.category IN ('in-progress', 'rescheduled') AND DATE(b.session_date) >= CURDATE()
     ORDER BY b.session_date ASC, b.id ASC`,
    [coachId]
  );

  const fullName = coachRow ? `${coachRow.first_name} ${coachRow.last_name}`.trim() : 'Coach';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'CC';

  const mapLessonRow = row => ({
    id: String(row.id),
    date: formatDate(row.session_date),
    time: row.time_range,
    lesson: row.lesson_type,
    student: row.student_name,
    status: row.status,
    paymentStatus: row.payment_status
  });

  return {
    tutor: coachRow
      ? {
          id: coachRow.id,
          name: fullName,
          coachName: `Coach ${coachRow.first_name}`,
          role: coachRow.role,
          email: coachRow.email,
          avatar: initials
        }
      : null,
    stats: {
      todayLessons: Number(override?.today_lessons ?? counts?.todayLessons ?? 0),
      upcomingLessons: Number(override?.upcoming_lessons ?? counts?.upcomingLessons ?? 0),
      myStudents: Number(override?.my_students ?? counts?.myStudents ?? 0),
      pendingConfirmation: Number(override?.pending_confirmation ?? counts?.pendingConfirmation ?? 0)
    },
    todaysSchedule: todayRows.map(mapLessonRow),
    upcomingLessons: upcomingRows.map(mapLessonRow)
  };
}

async function updateDashboardStats(coachId, stats) {
  const { todayLessons, upcomingLessons, myStudents, pendingConfirmation } = stats;
  await pool.query(
    `INSERT INTO coach_overview_overrides
       (coach_id, today_lessons, upcoming_lessons, my_students, pending_confirmation)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       today_lessons = COALESCE(VALUES(today_lessons), today_lessons),
       upcoming_lessons = COALESCE(VALUES(upcoming_lessons), upcoming_lessons),
       my_students = COALESCE(VALUES(my_students), my_students),
       pending_confirmation = COALESCE(VALUES(pending_confirmation), pending_confirmation)`,
    [
      coachId,
      typeof todayLessons === 'number' ? Math.max(0, todayLessons) : null,
      typeof upcomingLessons === 'number' ? Math.max(0, upcomingLessons) : null,
      typeof myStudents === 'number' ? Math.max(0, myStudents) : null,
      typeof pendingConfirmation === 'number' ? Math.max(0, pendingConfirmation) : null
    ]
  );

  const data = await getDashboardData(coachId);
  return data.stats;
}

module.exports = {
  getDashboardData,
  updateDashboardStats
};