module.exports = (err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ success: false, message: err.message });
  console.error(err);
  res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
};