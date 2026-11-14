const userModel = require('../../models/shared/userModel');
const coachService = require('./coachService');

const daysLeft = iso => Math.max(1, Math.ceil((new Date(iso) - Date.now()) / 86400000));

// ---- not built yet: replace each with a real query later ----
const lessonStats = async () => ({ today: 0, week: 0, completedThisWeek: 0 });   // needs a lessons table
const bandRequestCount = async () => 0;                                          // needs a band_bookings table
const paymentStats = async () => ({ total: 0, solo: 0, band: 0, changeFromLastMonth: 0 }); // needs a payments table
const ratingStats = async () => ({ average: null, count: 0 });                   // needs a ratings table
const bookingCounts = async coaches => ({                                        // needs lessons / band_bookings
  coaches: coaches.map(c => ({ id: c.id, name: c.name, count: 0 })),
  band: 0
});

const attentionItems = coaches => {
  const items = [];
  coaches.forEach(c => {
    if (c.status === 'invited') {
      items.push({ id: `invited-${c.id}`, title: `Waiting for ${c.name} to set a password`,
        detail: `Invite sent · expires in ${daysLeft(c.inviteExpiresAt)} days`, actions: [{ label: 'Review', to: '/admin/coaches' }] });
    } else if (c.status === 'expired') {
      items.push({ id: `expired-${c.id}`, title: `${c.name}’s invite expired`,
        detail: 'They can’t log in yet', actions: [{ label: 'Send new invite', to: '/admin/coaches', primary: true }] });
    }
  });
  return items;
};

exports.get = async () => {
  const [byRole, coaches, lessons, bandRequests, payments, ratings] = await Promise.all([
    userModel.countByRole(), coachService.list(), lessonStats(), bandRequestCount(), paymentStats(), ratingStats()
  ]);
  const active = coaches.filter(c => c.status === 'active');
  return {
    people: { parents: byRole.parent || 0, students: byRole.student || 0 },
    lessons,
    bandRequests,
    attention: attentionItems(coaches),
    bookingsPerCoach: await bookingCounts(active),
    payments,
    ratings
  };
};