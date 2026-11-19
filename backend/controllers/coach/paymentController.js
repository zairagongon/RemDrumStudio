const paymentModel = require('../../models/coach/paymentModel');

exports.getPayments = async (req, res, next) => {
  try {
    const data = await paymentModel.getPaymentsData(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getBandShares = async (req, res, next) => {
  try {
    const { bandShareSummary, bandShares } = await paymentModel.getBandBookingShares(req.user.id);
    res.json({ summary: bandShareSummary, shares: bandShares });
  } catch (err) {
    next(err);
  }
};

exports.markAsPaid = async (req, res, next) => {
  try {
    const result = await paymentModel.markPaymentAsPaid(req.user.id, req.params.id);
    if (result.notFound) {
      return res.status(404).json({ message: 'Payment record not found' });
    }
    if (result.alreadyPaid) {
      return res.status(400).json({ message: 'Session is already paid.' });
    }
    res.json({
      message: 'Payment recorded as paid successfully!',
      payment: result.payment,
      summary: result.summary
    });
  } catch (err) {
    next(err);
  }
};