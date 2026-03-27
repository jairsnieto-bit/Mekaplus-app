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
      const senderId = req.body.senderId;
      if (senderId) {
        guidesData.senderId = senderId;
      }
      console.log('✅ Excel procesado. Guías encontradas:', guidesData.length); 
      
      console.log('🔄 Guardando en base de datos...');
      const guides = await guideService.createGuidesBulk(guidesData, req.user.id);
      console.log('✅ Guías creadas:', guides.length);

      // ✅ Extraer TODOS los IDs de las guías creadas
      const allGuideIds = guides.map(g => g.id);

      res.status(201).json({
        message: `Successfully created ${guides.length} guides`,
        count: guides.length,
        guides: guides.slice(0, 10),   // Preview de 10
        allGuideIds: allGuideIds        // ✅ Todos los IDs para imprimir
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
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        search: req.query.search || '',
        status: req.query.status || '',
        city: req.query.city || '',
        guideNumber: req.query.guideNumber || '',
        guideNumberFrom: req.query.guideNumberFrom || '',  // ✅ AGREGAR
        guideNumberTo: req.query.guideNumberTo || '',      // ✅ AGREGAR
        startDate: req.query.startDate || '',
        endDate: req.query.endDate || ''
      };
      
      console.log('=== FILTROS EN CONTROLLER ===');
      console.log('guideNumberFrom:', filters.guideNumberFrom);
      console.log('guideNumberTo:', filters.guideNumberTo);

      const result = await guideService.getGuides(filters);
      res.json(result);
    } catch (error) {
      console.error('Error en getGuides:', error);
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

      console.log(`📄 Solicitando PDF para ${ids.length} guías...`);

      const pdfBuffer = await guideService.generatePDF(ids);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=guias-${Date.now()}.pdf`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('❌ Error en downloadPDF:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getStatistics(req, res) {
    try {
      const stats = await guideService.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error en getStatistics:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getSenders(req, res) {
    try {
      const senders = await guideService.getSenders();
      res.json(senders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createSender(req, res) {
    try {
      const sender = await guideService.createSender(req.body);
      res.status(201).json(sender);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

async updateGuideStatus(req, res) {
  try {
    console.log('=== [UPDATE STATUS] ===');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('File exists:', !!req.file);
    console.log('Headers:', req.headers['content-type']);
    
    const { id } = req.params;
    const { status, observation, deliveryType } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'El estado es requerido' });
    }

    // ✅ Validar observación
    if (!observation || observation.trim() === '') {
      return res.status(400).json({ error: 'La observación es obligatoria' });
    }

    // ✅ Validar evidencia fotográfica para estados críticos
    const requiresEvidence = ['ENTREGADA', 'DEVUELTA'].includes(status);
    let evidenceImagePath = null;

    if (requiresEvidence) {
      console.log('🔍 Requiere evidencia: SI');
      console.log('📁 req.file:', req.file);
      
      if (!req.file) {
        console.error('❌ ERROR: No se recibió archivo');
        console.log('Content-Type:', req.headers['content-type']);
        return res.status(400).json({ 
          error: 'La evidencia fotográfica es obligatoria para este estado' 
        });
      }
      
      // ✅ Guardar ruta relativa de la imagen
      evidenceImagePath = `/uploads/evidence/${req.file.filename}`;
      console.log('✅ Ruta de imagen:', evidenceImagePath);
    }

    const guide = await guideService.updateGuideStatus(
      id, 
      status, 
      observation, 
      deliveryType,
      evidenceImagePath,  // ✅ Pasar ruta de la imagen
      req.user.id
    );
    
    res.json({
      guide,
      message: 'Estado actualizado correctamente',
      evidenceImage: evidenceImagePath
    });
  } catch (error) {
    console.error('❌ Error en updateGuideStatus:', error);
    res.status(400).json({ error: error.message });
  }
}

  async getGuideStatusHistory(req, res) {
    try {
      const { id } = req.params;
      const history = await guideService.getGuideStatusHistory(id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  ////  método para obtener evidencia:
  async getGuideEvidence(req, res) {
  try {
    const { id } = req.params;
        const guide = await guideService.getGuideById(id);
        if (!guide) {
      return res.status(404).json({ error: 'Guía no encontrada' });
    }    
    if (!guide.evidenceImage) {
      return res.status(404).json({ error: 'No hay evidencia disponible' });
    }    
    res.json({
      guide: {
        id: guide.id,
        guideNumber: guide.guideNumber,
        estado: guide.estado,
        evidenceImage: guide.evidenceImage,
        fechaEntrega: guide.fechaEntrega,
        updatedAt: guide.updatedAt
      }
    });
    } catch (error) {
      console.error('Error getting guide evidence:', error);
      res.status(500).json({ error: error.message });
    }
  }


}



module.exports = new GuideController();