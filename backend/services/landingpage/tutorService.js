const tutorModel = require('../../models/landingpage/tutorModel');

exports.getTutors = () => tutorModel.findAll();