const dashboardModel = require('../../models/coach/dashboardModel');

exports.getDashboard = async (req, res, next) => {
  try {
    const coachId = req.user.id;
    const data = await dashboardModel.getDashboardData(coachId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.patchDashboardStats = async (req, res, next) => {
  try {
    const coachId = req.user.id;
    const stats = await dashboardModel.updateDashboardStats(coachId, req.body || {});
    res.json({ message: 'Overview stats updated', stats });
  } catch (err) {
    next(err);
  }
};