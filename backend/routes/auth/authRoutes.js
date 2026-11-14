const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');
const { validateSignup, validateLogin, validateNewPassword } = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/auth');

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.get('/me', requireAuth, authController.me);

router.get('/invite/:token', authController.inviteInfo);
router.post('/invite/:token', validateNewPassword, authController.acceptInvite);

module.exports = router;