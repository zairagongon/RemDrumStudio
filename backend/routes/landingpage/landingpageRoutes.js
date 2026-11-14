const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/landingpage/contactController');
const tutorController = require('../../controllers/landingpage/tutorController');
const { validateContact } = require('../../middleware/validate');

router.get('/tutors', tutorController.getTutors);
router.post('/contact', validateContact, contactController.sendMessage);

module.exports = router;