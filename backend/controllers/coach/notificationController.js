const notificationModel = require('../../models/coach/notificationModel');

exports.listNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationModel.getNotifications(req.user.id);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

exports.readNotification = async (req, res, next) => {
  try {
    const ok = await notificationModel.markNotificationRead(req.user.id, req.params.id);
    if (!ok) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
};

exports.readAllNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationModel.markAllNotificationsRead(req.user.id);
    res.json({ message: 'All notifications marked as read', notifications });
  } catch (err) {
    next(err);
  }
};