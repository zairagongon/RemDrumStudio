const contactService = require('../../services/landingpage/contactService');

exports.sendMessage = async (req, res, next) => {
  try {
    const id = await contactService.saveMessage(req.body);
    res.status(201).json({ success: true, message: 'Message sent.', id });
  } catch (err) {
    next(err);
  }
};