const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guide.controller');
const upload = require('../middlewares/upload.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { createExcelTemplate } = require('../utils/excelTemplate');

router.post('/', authenticateToken, guideController.createGuide);
router.post('/bulk', authenticateToken, upload.single('excel'), guideController.createGuidesBulk);
router.get('/', authenticateToken, guideController.getGuides);
router.get('/stats', authenticateToken, guideController.getStatistics);
router.get('/:id', authenticateToken, guideController.getGuideById);
router.get('/number/:number', authenticateToken, guideController.getGuideByNumber);
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
router.put('/:id', authenticateToken, guideController.updateGuide);
router.delete('/:id', authenticateToken, guideController.deleteGuide);
router.post('/download-pdf', authenticateToken, guideController.downloadPDF);

module.exports = router;