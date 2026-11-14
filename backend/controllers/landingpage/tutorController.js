const tutorService = require('../../services/landingpage/tutorService');

exports.getTutors = async (req, res, next) => {
  try {
    const data = await tutorService.getTutors();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};