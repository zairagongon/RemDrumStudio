const express = require('express');
const router = express.Router();

// Plug in your middleware/auth.js exports (update names if your auth.js exports e.g. authenticate / authorizeRole):
const { requireAuth, requireRole } = require('../../middleware/auth');

const dashboardController = require('../../controllers/coach/dashboardController');
const scheduleController = require('../../controllers/coach/scheduleController');
const studentController = require('../../controllers/coach/studentController');
const bookingController = require('../../controllers/coach/bookingController');
const paymentController = require('../../controllers/coach/paymentController');
const notificationController = require('../../controllers/coach/notificationController');

router.use(requireAuth, requireRole('coach'));

// Dashboard
router.get('/dashboard', dashboardController.getDashboard);
router.patch('/dashboard/stats', dashboardController.patchDashboardStats);
router.put('/dashboard/stats', dashboardController.patchDashboardStats);

// Schedule
router.get('/schedules', scheduleController.getSchedules);
router.post('/schedules/create-slot', scheduleController.createSlot);
router.patch('/schedules/:id', scheduleController.updateSlot);
router.put('/schedules/:id', scheduleController.updateSlot);
router.post('/schedules/:id/delete', scheduleController.deleteSlot);
router.delete('/schedules/:id', scheduleController.deleteSlot);

// Students
router.get('/students', studentController.getStudents);

// Bookings
router.get('/bookings', bookingController.getBookings);
router.post('/bookings/:id/complete', bookingController.markBookingComplete);
router.post('/bookings/:id/reschedule-accept', bookingController.acceptReschedule);
router.post('/bookings/:id/reschedule-suggest', bookingController.suggestReschedule);

// Payments
router.get('/payments', paymentController.getPayments);
router.post('/payments/:id/mark-paid', paymentController.markAsPaid);

// Notifications
router.get('/notifications', notificationController.listNotifications);
router.post('/notifications/:id/read', notificationController.readNotification);
router.post('/notifications/mark-all-read', notificationController.readAllNotifications);

module.exports = router;