const contactModel = require('../models/contactModel');

exports.saveMessage = async ({ name, email, message }) => {
  const clean = {
    name: name.trim().slice(0, 100),
    email: email.trim().toLowerCase().slice(0, 150),
    message: message.trim().slice(0, 2000)
  };
  return contactModel.create(clean);
};