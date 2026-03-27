const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');
const { uploadLogo } = require('../middlewares/upload.middleware'); // ✅ Cambiado
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

router.get('/guide', authenticateToken, configController.getGuideConfig);
router.put('/guide', authenticateToken, authorize('ADMIN'), configController.updateGuideConfig);

// ✅ Usar uploadLogo para el endpoint de logo
router.post('/guide/logo', authenticateToken, authorize('ADMIN'), uploadLogo.single('logo'), configController.uploadLogo);

router.post('/guide/reset-number', authenticateToken, authorize('ADMIN'), configController.resetGuideNumber);
router.get('/settings', authenticateToken, configController.getSettings);
router.put('/settings', authenticateToken, authorize('ADMIN'), configController.updateSetting);

module.exports = router;