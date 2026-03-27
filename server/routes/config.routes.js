const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware'); // ✅ IMPORTAR authorizeRole
const { uploadLogo } = require('../middlewares/upload.middleware');

// ✅ Rutas de configuración de guías
router.get('/guide', authenticateToken, configController.getGuideConfig);
router.put('/guide', authenticateToken, authorizeRole(['ADMIN']), configController.updateGuideConfig); // ✅ CORREGIDO
router.post('/guide/logo', authenticateToken, authorizeRole(['ADMIN']), uploadLogo.single('logo'), configController.uploadLogo); // ✅ CORREGIDO
router.post('/guide/reset-number', authenticateToken, authorizeRole(['ADMIN']), configController.resetGuideNumber); // ✅ CORREGIDO

// ✅ Rutas de settings generales
router.get('/settings', authenticateToken, configController.getSettings);
router.put('/settings', authenticateToken, authorizeRole(['ADMIN']), configController.updateSetting); // ✅ CORREGIDO

module.exports = router;