const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware'); // ✅ IMPORTAR authorizeRole

// ✅ Rutas de configuración
router.get('/guide', authenticateToken, configController.getGuideConfig);
router.put('/guide', authenticateToken, authorizeRole(['ADMIN']), configController.updateGuideConfig); // ✅ Usar authorizeRole con array
router.post('/guide/logo', authenticateToken, authorizeRole(['ADMIN']), configController.uploadLogo);
router.post('/guide/reset-number', authenticateToken, authorizeRole(['ADMIN']), configController.resetGuideNumber);

// ✅ Rutas de settings generales
router.get('/settings', authenticateToken, configController.getSettings);
router.put('/settings', authenticateToken, authorizeRole(['ADMIN']), configController.updateSetting); // ✅ CORREGIDO

module.exports = router;