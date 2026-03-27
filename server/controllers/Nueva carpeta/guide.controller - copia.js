const guideService = require('../services/guide.service');
const excelService = require('../services/excel.service');

class GuideController {
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
      // ✅ NUEVO: Obtener senderId del body
      const senderId = req.body.senderId;
      if (senderId) {
          guidesData.senderId = senderId;
        }
      console.log('✅ Excel procesado. Guías encontradas:', guidesData.length); 
      
      console.log('🔄 Guardando en base de datos...');
      const guides = await guideService.createGuidesBulk(guidesData, req.user.id);
      console.log('✅ Guías creadas:', guides.length);

      // ✅ NUEVO: Extraer TODOS los IDs de las guías creadas
      const allGuideIds = guides.map(g => g.id);

      res.status(201).json({
        message: `Successfully created ${guides.length} guides`,
        count: guides.length,
        guides: guides.slice(0, 10),   // Preview de 10 guías
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
      console.log('=== FILTROS RECIBIDOS ===');
      console.log('Query:', req.query);
      
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        search: req.query.search || '',
        status: req.query.status || '',
        city: req.query.city || '',
        guideNumber: req.query.guideNumber || '',
        startDate: req.query.startDate || '',
        endDate: req.query.endDate || ''
      };

      console.log('Filtros procesados:', filters);

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

  /*async downloadPDF(req, res) {
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

    async downloadPDF(req, res) {
      try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ error: 'No guide IDs provided' });
        }

        console.log(`📄 Generando PDF para ${ids.length} guías...`);

        // ✅ Si son muchas guías, procesar en lotes
        if (ids.length > 100) {
          console.log('⚠️ Muchas guías, procesando en lotes...');
          const batchSize = 100;
          const allGuides = [];
          
          for (let i = 0; i < ids.length; i += batchSize) {
            const batch = ids.slice(i, i + batchSize);
            const batchGuides = await guideService.getGuidesByIds(batch);
            allGuides.push(...batchGuides);
            console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}: ${batchGuides.length} guías`);
          }
          
          const config = await prisma.guideConfig.findFirst();
          const settings = await prisma.setting.findMany();
          const pdfService = require('../services/pdf.service');
          const pdfBuffer = await pdfService.generateGuidesPDF(allGuides, config, settings);
          
          console.log(`✅ PDF generado: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=guias-masivas-${ids.length}-${Date.now()}.pdf`);
          res.send(pdfBuffer);
        } else {
          // Pocas guías, proceso normal
          const pdfBuffer = await guideService.generatePDF(ids);
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=guides-${Date.now()}.pdf`);
          res.send(pdfBuffer);
        }
      } catch (error) {
        console.error('❌ Error generating PDF:', error);
        res.status(500).json({ error: error.message });
      }
    }*/ 
    async downloadPDF(req, res) {
            try {
              const { ids } = req.body;
              
              if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ error: 'No guide IDs provided' });
              }

              console.log(`📄 Solicitando PDF para ${ids.length} guías...`);

              // ✅ Llamar al service (que maneja lotes automáticamente)
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
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ AGREGAR: Al final del controller
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
// ✅ AGREGAR: Actualizar estado con observación
async updateGuideStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, observation } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'El estado es requerido' });
    }

    const guide = await guideService.updateGuideStatus(id, status, observation, req.user.id);
    res.json(guide);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ✅ AGREGAR: Obtener historial de estados
async getGuideStatusHistory(req, res) {
  try {
    const { id } = req.params;
    const history = await guideService.getGuideStatusHistory(id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


}

module.exports = new GuideController();