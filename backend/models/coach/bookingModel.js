const pool = require('../../config/db');

function formatDate(dateVal) {
  return new Date(dateVal).toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });
}

function mapBooking(row) {
  return {
    id: String(row.id),
    date: formatDate(row.session_date),
    time: row.time_range,
    student: row.student_name,
    lesson: row.lesson_type,
    wants: row.requested_schedule || null,
    paymentStatus: row.payment_status,
    category: row.category,
    status: row.status
  };
}

async function findBookings(coachId, filter) {
  const params = [coachId];
  let whereCategory = '';

  if (filter && filter !== 'all') {
    whereCategory = ' AND b.category = ?';
    params.push(filter);
  }

  const [rows] = await pool.query(
    `SELECT
       b.id,
       b.session_date,
       b.time_range,
       b.lesson_type,
       b.category,
       b.status,
       b.payment_status,
       b.requested_schedule,
       CONCAT(u.first_name, ' ', u.last_name) AS student_name
     FROM lesson_bookings b
     JOIN users u ON u.id = b.student_id
     WHERE b.coach_id = ? ${whereCategory}
     ORDER BY b.session_date ASC, b.id DESC`,
    params
  );

  return rows.map(mapBooking);
}

async function getBookingById(coachId, id) {
  const [[row]] = await pool.query(
    `SELECT
       b.id,
       b.session_date,
       b.time_range,
       b.lesson_type,
       b.category,
       b.status,
       b.payment_status,
       b.requested_schedule,
       CONCAT(u.first_name, ' ', u.last_name) AS student_name
     FROM lesson_bookings b
     JOIN users u ON u.id = b.student_id
     WHERE b.id = ? AND b.coach_id = ?
     LIMIT 1`,
    [id, coachId]
  );
  return row ? mapBooking(row) : null;
}

async function completeBooking(coachId, id) {
  const [result] = await pool.query(
    `UPDATE lesson_bookings
     SET category = 'completed', status = 'Completed'
     WHERE id = ? AND coach_id = ?`,
    [id, coachId]
  );
  if (result.affectedRows === 0) return null;
  return getBookingById(coachId, id);
}

async function acceptBookingReschedule(coachId, id) {
  const [[existing]] = await pool.query(
    `SELECT requested_schedule FROM lesson_bookings WHERE id = ? AND coach_id = ? LIMIT 1`,
    [id, coachId]
  );
  if (!existing) return null;

  await pool.query(
    `UPDATE lesson_bookings
     SET category = 'in-progress',
         status = 'Reschedule Confirmed',
         requested_schedule = NULL
     WHERE id = ? AND coach_id = ?`,
    [id, coachId]
  );

  return getBookingById(coachId, id);
}

async function suggestBookingReschedule(coachId, id, suggestedTime) {
  const nextProposal = suggestedTime
    ? `${suggestedTime} (Offer sent to student)`
    : 'Counter-offer sent to student';

  const [result] = await pool.query(
    `UPDATE lesson_bookings
     SET requested_schedule = ?
     WHERE id = ? AND coach_id = ?`,
    [nextProposal, id, coachId]
  );
  if (result.affectedRows === 0) return null;
  return getBookingById(coachId, id);
}

module.exports = {
  findBookings,
  completeBooking,
  acceptBookingReschedule,
  suggestBookingReschedule
};