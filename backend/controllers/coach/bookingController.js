const bookingModel = require('../../models/coach/bookingModel');

exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await bookingModel.findBookings(req.user.id, req.query.filter);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.markBookingComplete = async (req, res, next) => {
  try {
    const booking = await bookingModel.completeBooking(req.user.id, req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking marked as completed!', booking });
  } catch (err) {
    next(err);
  }
};

exports.acceptReschedule = async (req, res, next) => {
  try {
    const booking = await bookingModel.acceptBookingReschedule(req.user.id, req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Reschedule request accepted!', booking });
  } catch (err) {
    next(err);
  }
};

exports.suggestReschedule = async (req, res, next) => {
  try {
    const booking = await bookingModel.suggestBookingReschedule(
      req.user.id,
      req.params.id,
      req.body?.suggestedTime
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Suggested another time to the student!', booking });
  } catch (err) {
    next(err);
  }
};