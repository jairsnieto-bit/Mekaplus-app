const guideService = require('../services/guide.service');
const excelService = require('../services/excel.service');

class GuideController {
  async createGuide(req, res) {
    try {
      const guide = await guideService.createGuide(req.body, req.user.id);
      res.status(201).json(guide);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createGuidesBulk(req, res) {
    console.log('=== [BULK UPLOAD] Iniciando procesamiento ===');
    console.log('Archivo recibido:', req.file ? req.file.originalname : 'NO FILE');
    console.log('User:', req.user?.email);
    
    try {
      if (!req.file) {
        console.error('❌ Error: No se recibió archivo');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('📄 Tamaño del archivo:', req.file.size, 'bytes');
      console.log('📄 Tipo MIME:', req.file.mimetype);
      
      const buffer = req.file.buffer;
      console.log('🔄 Leyendo Excel...');
      
      const guidesData = excelService.parseExcel(buffer);
      console.log('✅ Excel procesado. Guías encontradas:', guidesData.length);

      console.log('🔄 Guardando en base de datos...');
      const guides = await guideService.createGuidesBulk(guidesData, req.user.id);
      console.log('✅ Guías creadas:', guides.length);

      res.status(201).json({
        message: `Successfully created ${guides.length} guides`,
        count: guides.length,
        guides: guides.slice(0, 10)
      });
      
    } catch (error) {
      console.error('❌ [BULK UPLOAD] ERROR:', error.message);
      console.error('❌ Stack:', error.stack);
      res.status(400).json({ 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async getGuides(req, res) {
    try {
      const result = await guideService.getGuides(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getGuideById(req, res) {
    try {
      const guide = await guideService.getGuideById(req.params.id);
      res.json(guide);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getGuideByNumber(req, res) {
    try {
      const guide = await guideService.getGuideByNumber(req.params.number);
      if (!guide) {
        return res.status(404).json({ error: 'Guide not found' });
      }
      res.json(guide);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateGuide(req, res) {
    try {
      const guide = await guideService.updateGuide(req.params.id, req.body);
      res.json(guide);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteGuide(req, res) {
    try {
      const result = await guideService.deleteGuide(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async downloadPDF(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No guide IDs provided' });
      }

      const pdfBuffer = await guideService.generatePDF(ids);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=guides-${Date.now()}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStatistics(req, res) {
    try {
      const stats = await guideService.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new GuideController();