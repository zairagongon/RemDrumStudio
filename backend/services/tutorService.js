const tutorModel = require('../models/tutorModel');

exports.getTutors = () => tutorModel.findAll();