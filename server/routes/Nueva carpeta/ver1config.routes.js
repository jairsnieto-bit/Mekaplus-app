const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');
const upload = require('../middlewares/upload.middleware');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

router.get('/guide', authenticateToken, configController.getGuideConfig);
router.put('/guide', authenticateToken, authorize('ADMIN'), configController.updateGuideConfig);
router.post('/guide/logo', authenticateToken, authorize('ADMIN'), upload.single('logo'), configController.uploadLogo);
router.post('/guide/reset-number', authenticateToken, authorize('ADMIN'), configController.resetGuideNumber);
router.get('/settings', authenticateToken, configController.getSettings);
router.put('/settings', authenticateToken, authorize('ADMIN'), configController.updateSetting);

module.exports = router;