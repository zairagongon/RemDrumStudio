const scheduleModel = require('../../models/coach/scheduleModel');

exports.getSchedules = async (req, res, next) => {
  try {
    const data = await scheduleModel.getSchedulesData(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createSlot = async (req, res, next) => {
  try {
    const { date, start, end } = req.body || {};
    if (!date || !start || !end) {
      return res.status(400).json({ message: 'Please provide Date, Start, and End times.' });
    }
    const created = await scheduleModel.createAvailableSlot(req.user.id, {
      date,
      start,
      end,
      tutorName: req.user.name
    });
    res.status(201).json({
      message: 'Available slot created successfully!',
      ...created
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSlot = async (req, res, next) => {
  try {
    const slot = await scheduleModel.updateWeeklySlot(req.user.id, req.params.id, req.body || {});
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    res.json({ message: 'Slot updated successfully', slot });
  } catch (err) {
    next(err);
  }
};

exports.deleteSlot = async (req, res, next) => {
  try {
    await scheduleModel.deleteWeeklySlot(req.user.id, req.params.id);
    res.json({ message: 'Slot deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
};