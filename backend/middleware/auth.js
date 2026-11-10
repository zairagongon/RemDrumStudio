const authService = require('../services/authService');

exports.requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Please log in.' });
  try {
    const { id, role } = authService.verifyToken(token);
    req.user = { id, role };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Your session expired. Please log in again.' });
  }
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ success: false, message: 'You do not have access to this.' });
  next();
};