const pool = require('../../config/db');

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function formatDate(dateVal) {
  return new Date(dateVal).toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });
}

async function getSchedulesData(coachId) {
  const [rows] = await pool.query(
    `SELECT
       s.id,
       s.slot_date,
       s.start_time,
       s.end_time,
       s.lesson_type,
       s.status,
       CONCAT(u.first_name, ' ', u.last_name) AS tutor_name
     FROM coach_slots s
     LEFT JOIN users u ON u.id = s.coach_id
     WHERE s.coach_id = ?
     ORDER BY s.slot_date ASC, s.id DESC`,
    [coachId]
  );

  const weeklyColumns = { MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [] };

  const weeklyLessonSlots = rows.map(row => {
    const dayKey = DAYS[new Date(row.slot_date).getDay()] || 'MON';
    weeklyColumns[dayKey].push({
      id: `slot-${row.id}`,
      time: row.start_time,
      status: row.status === 'Booked' ? 'BOOKED' : 'AVAILABLE'
    });

    return {
      id: String(row.id),
      date: formatDate(row.slot_date),
      time: `${row.start_time} - ${row.end_time}`,
      tutor: row.tutor_name || 'Coach',
      lesson: row.lesson_type,
      status: row.status
    };
  });

  return { weeklyColumns, weeklyLessonSlots };
}

async function createAvailableSlot(coachId, { date, start, end, tutorName }) {
  const parsedDate = new Date(date);
  const isoDate = Number.isNaN(parsedDate.getTime())
    ? String(date).slice(0, 10)
    : parsedDate.toISOString().slice(0, 10);

  const [result] = await pool.query(
    `INSERT INTO coach_slots (coach_id, slot_date, start_time, end_time, lesson_type, status)
     VALUES (?, ?, ?, ?, 'Drum Lesson', 'Available')`,
    [coachId, isoDate, start.trim(), end.trim()]
  );

  const id = String(result.insertId);
  return {
    slot: {
      id: `slot-${id}`,
      time: start.trim(),
      status: 'AVAILABLE'
    },
    weeklySlot: {
      id,
      date: formatDate(isoDate),
      time: `${start.trim()} - ${end.trim()}`,
      tutor: tutorName || 'Coach',
      lesson: 'Drum Lesson',
      status: 'Available'
    }
  };
}

async function updateWeeklySlot(coachId, id, { date, time, lesson, status }) {
  const [[existing]] = await pool.query(
    `SELECT * FROM coach_slots WHERE id = ? AND coach_id = ? LIMIT 1`,
    [id, coachId]
  );
  if (!existing) return null;

  let nextDate = existing.slot_date;
  if (date) {
    const d = new Date(date);
    if (!Number.isNaN(d.getTime())) nextDate = d.toISOString().slice(0, 10);
  }

  let nextStart = existing.start_time;
  let nextEnd = existing.end_time;
  if (time && time.includes('-')) {
    const [s, e] = time.split('-').map(p => p.trim());
    if (s) nextStart = s;
    if (e) nextEnd = e;
  }

  const nextLesson = lesson || existing.lesson_type;
  const nextStatus = status || existing.status;

  await pool.query(
    `UPDATE coach_slots
     SET slot_date = ?, start_time = ?, end_time = ?, lesson_type = ?, status = ?
     WHERE id = ? AND coach_id = ?`,
    [nextDate, nextStart, nextEnd, nextLesson, nextStatus, id, coachId]
  );

  return {
    id: String(id),
    date: formatDate(nextDate),
    time: `${nextStart} - ${nextEnd}`,
    lesson: nextLesson,
    status: nextStatus
  };
}

async function deleteWeeklySlot(coachId, id) {
  const [result] = await pool.query(
    `DELETE FROM coach_slots WHERE id = ? AND coach_id = ?`,
    [id, coachId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getSchedulesData,
  createAvailableSlot,
  updateWeeklySlot,
  deleteWeeklySlot
};