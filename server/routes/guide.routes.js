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

// ✅ NUEVA: Ruta para obtener destinatarios existentes
router.get('/recipients', authenticateToken, guideController.getExistingRecipients);
// ✅ Ruta para exportar a Excel
router.post('/export-excel', authenticateToken, guideController.exportToExcel);


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
// ✅ Rutas de evidencia (después de las demás rutas)
router.get('/:id/evidence', authenticateToken, guideController.getGuideEvidence);
module.exports = router;
// ... otras rutas ...
router.get('/recipients', authenticateToken, guideController.getExistingRecipients);
// ...
// ✅ Ruta de debug para verificar IDs
router.get('/debug/ids', authenticateToken, async (req, res) => {
  try {
    const guides = await prisma.guide.findMany({
      select: { 
        id: true, 
        guideNumber: true,
        razonSocial: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    res.json({
      count: guides.length,
      guides
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});