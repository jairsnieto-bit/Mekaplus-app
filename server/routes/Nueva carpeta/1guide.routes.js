const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guide.controller');
const { uploadExcel, uploadEvidence } = require('../middlewares/upload.middleware');  // ✅ Agregar uploadEvidence
const { authenticateToken } = require('../middlewares/auth.middleware');
const { createExcelTemplate } = require('../utils/excelTemplate');

// ✅ RUTAS ESPECÍFICAS PRIMERO (sin parámetros :id)
router.post('/', authenticateToken, guideController.createGuide);
router.post('/bulk', authenticateToken, uploadExcel.single('excel'), guideController.createGuidesBulk);
router.get('/', authenticateToken, guideController.getGuides);
router.get('/stats', authenticateToken, guideController.getStatistics);
router.get('/senders', authenticateToken, guideController.getSenders);
router.post('/senders', authenticateToken, guideController.createSender);

router.get('/template', authenticateToken, (req, res) => {
  try {
    const buffer = createExcelTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=plantilla_guias.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar plantilla' });
  }
});

router.post('/download-pdf', authenticateToken, guideController.downloadPDF);

// ✅ RUTAS CON PARÁMETROS :id AL FINAL
router.get('/number/:number', authenticateToken, guideController.getGuideByNumber);
router.get('/:id', authenticateToken, guideController.getGuideById);
router.put('/:id', authenticateToken, guideController.updateGuide);
router.delete('/:id', authenticateToken, guideController.deleteGuide);

// ✅ RUTAS DE ESTADO (CON uploadEvidence)
router.put('/:id/status', 
  authenticateToken, 
  uploadEvidence.single('evidenceImage'),  // ✅ Middleware para subir imagen
  guideController.updateGuideStatus
);
router.get('/:id/history', authenticateToken, guideController.getGuideStatusHistory);

module.exports = router;