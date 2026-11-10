const EMAIL = /^\S+@\S+\.\S+$/;
const text = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;
const bad = (res, message) => res.status(400).json({ success: false, message });

exports.validateContact = (req, res, next) => {
  const { name, email, message } = req.body || {};
  if (!text(name, 100) || !EMAIL.test(String(email || '').trim()) || !text(message, 2000)) {
    return bad(res, 'Please provide a valid name, email, and message.');
  }
  next();
};

// Only students and parents can sign up publicly. Coaches/admins are created by the admin.
exports.validateSignup = (req, res, next) => {
  const { role, firstName, lastName, email, password } = req.body || {};
  if (!['student', 'parent'].includes(role)) return bad(res, 'Please choose Student or Parent.');
  if (!text(firstName, 50) || !text(lastName, 50)) return bad(res, 'Please enter your first and last name.');
  if (!EMAIL.test(String(email || '').trim()) || String(email).length > 150) return bad(res, 'Please enter a valid email.');
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) return bad(res, 'Password must be 8 to 72 characters.');
  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return bad(res, 'Please enter your email and password.');
  }
  next();
};