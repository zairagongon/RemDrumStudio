const studentModel = require('../../models/coach/studentModel');

exports.getStudents = async (req, res, next) => {
  try {
    const students = await studentModel.findStudents(req.user.id, req.query);
    res.json(students);
  } catch (err) {
    next(err);
  }
};