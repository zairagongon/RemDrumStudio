const pool = require('../../config/db');

function formatDate(dateVal) {
  return new Date(dateVal).toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });
}

async function getBandBookingShares(coachId) {
  const [shareRows] = await pool.query(
    `SELECT
       id,
       booking_ref,
       band_name,
       session_type,
       session_date,
       time_range,
       total_booking_fee,
       share_percent,
       coach_share,
       studio_share,
       status,
       payout_date
     FROM band_booking_shares
     WHERE coach_id = ?
     ORDER BY session_date DESC, id DESC`,
    [coachId]
  );

  const [[shareAgg]] = await pool.query(
    `SELECT
       COALESCE(SUM(coach_share), 0) AS totalEarned,
       COALESCE(SUM(CASE WHEN status = 'Released' THEN coach_share ELSE 0 END), 0) AS released,
       COALESCE(SUM(CASE WHEN status != 'Released' THEN coach_share ELSE 0 END), 0) AS pending
     FROM band_booking_shares
     WHERE coach_id = ?`,
    [coachId]
  );

  return {
    bandShareSummary: {
      totalEarned: Number(shareAgg?.totalEarned ?? 0),
      released: Number(shareAgg?.released ?? 0),
      pending: Number(shareAgg?.pending ?? 0)
    },
    bandShares: shareRows.map(row => ({
      id: String(row.id),
      bookingRef: row.booking_ref,
      bandName: row.band_name,
      sessionType: row.session_type,
      date: formatDate(row.session_date),
      time: row.time_range,
      totalBookingFee: Number(row.total_booking_fee),
      sharePercent: Number(row.share_percent),
      coachShare: Number(row.coach_share),
      studioShare: Number(row.studio_share),
      status: row.status,
      payoutDate: row.payout_date ? formatDate(row.payout_date) : 'Pending studio release'
    }))
  };
}

async function getPaymentsData(coachId) {
  const [rows] = await pool.query(
    `SELECT
       p.id,
       p.amount,
       p.status,
       b.lesson_type,
       b.session_date,
       CONCAT(u.first_name, ' ', u.last_name) AS student_name
     FROM lesson_payments p
     JOIN lesson_bookings b ON b.id = p.booking_id
     JOIN users u ON u.id = p.student_id
     WHERE p.coach_id = ?
     ORDER BY b.session_date DESC, p.id DESC`,
    [coachId]
  );

  const [[agg]] = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END), 0) AS collected,
       COALESCE(SUM(CASE WHEN status = 'Unpaid' THEN amount ELSE 0 END), 0) AS stillUnpaid,
       COALESCE(MAX(amount), 500) AS lessonFee
     FROM lesson_payments
     WHERE coach_id = ?`,
    [coachId]
  );

  const { bandShareSummary, bandShares } = await getBandBookingShares(coachId);

  return {
    summary: {
      collected: Number(agg?.collected ?? 0),
      stillUnpaid: Number(agg?.stillUnpaid ?? 0),
      lessonFee: Number(agg?.lessonFee ?? 500)
    },
    records: rows.map(row => ({
      id: String(row.id),
      student: row.student_name,
      lesson: row.lesson_type,
      date: formatDate(row.session_date),
      amount: Number(row.amount),
      status: row.status
    })),
    bandShareSummary,
    bandShares
  };
}

async function markPaymentAsPaid(coachId, id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[payment]] = await conn.query(
      `SELECT p.*, b.lesson_type, b.session_date, CONCAT(u.first_name, ' ', u.last_name) AS student_name
       FROM lesson_payments p
       JOIN lesson_bookings b ON b.id = p.booking_id
       JOIN users u ON u.id = p.student_id
       WHERE p.id = ? AND p.coach_id = ?
       FOR UPDATE`,
      [id, coachId]
    );

    if (!payment) {
      await conn.rollback();
      return { notFound: true };
    }
    if (payment.status === 'Paid') {
      await conn.rollback();
      return { alreadyPaid: true };
    }

    await conn.query(
      `UPDATE lesson_payments SET status = 'Paid', paid_at = NOW() WHERE id = ?`,
      [id]
    );
    await conn.query(
      `UPDATE lesson_bookings SET payment_status = 'Paid' WHERE id = ?`,
      [payment.booking_id]
    );

    await conn.commit();

    const updatedData = await getPaymentsData(coachId);
    return {
      payment: {
        id: String(payment.id),
        student: payment.student_name,
        lesson: payment.lesson_type,
        date: formatDate(payment.session_date),
        amount: Number(payment.amount),
        status: 'Paid'
      },
      summary: updatedData.summary
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  getPaymentsData,
  getBandBookingShares,
  markPaymentAsPaid
};