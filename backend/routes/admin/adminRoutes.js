const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { validateCoach, validateCoachUpdate } = require('../../middleware/validate');

router.use(requireAuth, requireRole('admin'));

router.get('/overview', adminController.overview);
router.get('/coaches', adminController.listCoaches);
router.post('/coaches', validateCoach, adminController.createCoach);
router.post('/coaches/:id/invite', adminController.resendInvite);
router.patch('/coaches/:id', validateCoachUpdate, adminController.updateCoach);

module.exports = router;