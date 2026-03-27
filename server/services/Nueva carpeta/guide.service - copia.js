const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFService = require('./pdf.service');

class GuideService {
  async createGuide(data, userId) {
    try {
      const config = await prisma.guideConfig.findFirst();
      
      if (!config) {
        throw new Error('Configuración de guías no encontrada');
      }

      const guideNumber = `${config.guidePrefix}-${String(config.currentNumber).padStart(6, '0')}`;

      const guide = await prisma.guide.create({
        data: {
          guideNumber,
          senderId: data.senderId,
          razonSocial: data.razonSocial,
          direccion: data.direccion,
          localidad: data.localidad,
          identificacionUsuario: data.identificacionUsuario,
          referenciaEntrega: data.referenciaEntrega,
          fechaEntrega: data.fechaEntrega ? new Date(data.fechaEntrega) : null,
          horaEntrega: data.horaEntrega,
          estado: 'PENDIENTE',
          createdBy: userId
        },
        include: {
        sender: true  // ✅ NUEVO: Incluir datos del remitente
      }
      });

      await prisma.guideConfig.update({
        where: { id: config.id },
        data: { currentNumber: config.currentNumber + 1 }
      });

      return guide;
    } catch (error) {
      console.error('Error creating guide:', error);
      throw new Error(`Error al crear guía: ${error.message}`);
    }
  }

  async createGuidesBulk(guidesData, userId) {
    try {
      const config = await prisma.guideConfig.findFirst();
      
      if (!config) {
        throw new Error('Configuración de guías no encontrada');
      }

      const guides = [];
      let currentNumber = config.currentNumber;

      // ✅ NUEVO: senderId se pasa desde el controller (viene del frontend)
      const senderId = guidesData.senderId;

      for (const data of guidesData) {
        const guideNumber = `${config.guidePrefix}-${String(currentNumber).padStart(6, '0')}`;

        const guide = await prisma.guide.create({
          data: {
            guideNumber,
            senderId: senderId,  // ✅ NUEVO: Mismo remitente para todas
            razonSocial: data.razonSocial,
            direccion: data.direccion,
            localidad: data.localidad,
            identificacionUsuario: data.identificacionUsuario,
            referenciaEntrega: data.referenciaEntrega,
            fechaEntrega: data.fechaEntrega ? new Date(data.fechaEntrega) : null,
            horaEntrega: data.horaEntrega,
            estado: 'PENDIENTE',
            createdBy: userId
          },
          include: {
          sender: true  // ✅ NUEVO
        }
        });

        guides.push(guide);
        currentNumber++;
      }

      await prisma.guideConfig.update({
        where: { id: config.id },
        data: { currentNumber: currentNumber }
      });

      return guides;
    } catch (error) {
      console.error('Error creating bulk guides:', error);
      throw new Error(`Error al crear guías masivas: ${error.message}`);
    }
  }

      async getGuides(filters) {
        try {
          const { 
            page, 
            limit, 
            search, 
            status, 
            city, 
            guideNumber,
            guideNumberFrom,   // ✅ NUEVO
            guideNumberTo,     // ✅ NUEVO
            startDate, 
            endDate 
          } = filters;
          
          console.log('=== FILTROS EN SERVICIO ===');
          console.log('guideNumberFrom:', guideNumberFrom);
          console.log('guideNumberTo:', guideNumberTo);
          console.log('startDate:', startDate);
          console.log('endDate:', endDate);

          const where = {};

          // Búsqueda por texto
          if (search) {
            where.OR = [
              { guideNumber: { contains: search, mode: 'insensitive' } },
              { razonSocial: { contains: search, mode: 'insensitive' } },
              { referenciaEntrega: { contains: search, mode: 'insensitive' } }
            ];
          }

          // Filtrar por número de guía (búsqueda parcial)
          if (guideNumber) {
            where.guideNumber = { contains: guideNumber, mode: 'insensitive' };
          }

          // ✅ FILTRO POR RANGO DE GUÍAS (NUEVO)
          if (guideNumberFrom || guideNumberTo) {
            where.guideNumber = {};
            
            if (guideNumberFrom) {
              where.guideNumber.gte = guideNumberFrom; // Greater than or equal
              console.log('✅ Filtro aplicado: guideNumber >=', guideNumberFrom);
            }
            
            if (guideNumberTo) {
              where.guideNumber.lte = guideNumberTo; // Less than or equal
              console.log('✅ Filtro aplicado: guideNumber <=', guideNumberTo);
            }
            
            // Si también hay búsqueda por texto, combinar
            if (search || guideNumber) {
              const textFilter = where.OR || (where.guideNumber.contains ? { guideNumber: { contains: where.guideNumber.contains } } : null);
              if (textFilter) {
                where.AND = [where, textFilter];
              }
            }
          }

          // Filtrar por estado
          if (status) {
            where.estado = status;
          }

          // Filtrar por ciudad
          if (city) {
            where.localidad = { equals: city, mode: 'insensitive' };
          }

          // FILTRO POR FECHA
          if (startDate || endDate) {
            where.createdAt = {};
            
            if (startDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              where.createdAt.gte = start;
              console.log('Fecha inicio:', start);
            }
            
            if (endDate) {
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              where.createdAt.lte = end;
              console.log('Fecha fin:', end);
            }
          }

          console.log('Where clause:', JSON.stringify(where, null, 2));

          const skip = (page - 1) * limit;

          const [guides, total] = await Promise.all([
            prisma.guide.findMany({
              where,
              skip,
              take: limit,
              orderBy: { createdAt: 'desc' },
              include: {
                sender: true
              }
            }),
            prisma.guide.count({ where })
          ]);

          return {
            guides,
            page,
            totalPages: Math.ceil(total / limit),
            total
          };
        } catch (error) {
          console.error('Error getting guides:', error);
          throw new Error(`Error al obtener guías: ${error.message}`);
        }
      }
  // ✅ AGREGAR: Nuevo método para obtener remitentes
  async getSenders() {
    try {
      const senders = await prisma.sender.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
      return senders;
    } catch (error) {
      console.error('Error getting senders:', error);
      throw new Error(`Error al obtener remitentes: ${error.message}`);
    }
  }
// ✅ AGREGAR: Método para crear remitente (si se necesita)
async createSender(data) {
  try {
    const sender = await prisma.sender.create({
      data: {
         name: data.name,
        nit: data.nit,
        address: data.address,
        phone: data.phone,
        email: data.email,
        department: data.department
      } 
    });
      return sender; } catch (error) {
    console.error('Error creating sender:', error);
    throw new Error(`Error al crear remitente: ${error.message}`);
  }
    
}    

  async getGuideById(id) {
    try {
      // ✅ Sin include de createdByUser
      const guide = await prisma.guide.findUnique({
        where: { id }
      });

      if (!guide) {
        throw new Error('Guía no encontrada');
      }

      return guide;
    } catch (error) {
      console.error('Error getting guide by id:', error);
      throw new Error(`Error al obtener guía: ${error.message}`);
    }
  }

  async getGuideByNumber(number) {
    try {
      const guide = await prisma.guide.findFirst({
        where: {
          guideNumber: { contains: number, mode: 'insensitive' }
        }
      });

      return guide;
    } catch (error) {
      console.error('Error getting guide by number:', error);
      throw new Error(`Error al obtener guía: ${error.message}`);
    }
  }

  async updateGuide(id, data) {
    try {
      const guide = await prisma.guide.update({
        where: { id },
        data: {
          razonSocial: data.razonSocial,
          direccion: data.direccion,
          localidad: data.localidad,
          identificacionUsuario: data.identificacionUsuario,
          referenciaEntrega: data.referenciaEntrega,
          fechaEntrega: data.fechaEntrega ? new Date(data.fechaEntrega) : null,
          horaEntrega: data.horaEntrega,
          estado: data.estado
        }
      });

      return guide;
    } catch (error) {
      console.error('Error updating guide:', error);
      throw new Error(`Error al actualizar guía: ${error.message}`);
    }
  }

  async deleteGuide(id) {
    try {
      await prisma.guide.delete({
        where: { id }
      });

      return { message: 'Guía eliminada correctamente' };
    } catch (error) {
      console.error('Error deleting guide:', error);
      throw new Error(`Error al eliminar guía: ${error.message}`);
    }
  }


            async generatePDF(guidesIds) {
                try {
                  console.log(`📄 Generando PDF para ${guidesIds.length} guías...`);

                  // ✅ Si son muchas guías, procesar en lotes de 100
                  if (guidesIds.length > 102) {
                    console.log('⚠️ Muchas guías, procesando en lotes de 102...');
                    const batchSize = 102;
                    const allGuides = [];
                    
                    for (let i = 0; i < guidesIds.length; i += batchSize) {
                      const batch = guidesIds.slice(i, i + batchSize);
                      const batchGuides = await this.getGuidesByIds(batch);
                      allGuides.push(...batchGuides);
                      console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}: ${batchGuides.length} guías`);
                    }
                    
                    const config = await prisma.guideConfig.findFirst();
                    const settings = await prisma.setting.findMany();
                    
                    const pdfService = require('./pdf.service');
                    const pdfBuffer = await pdfService.generateGuidesPDF(allGuides, config, settings);
                    
                    console.log(`✅ PDF generado: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
                    return pdfBuffer;
                  } else {
                    // Pocas guías, proceso normal
                    const guides = await this.getGuidesByIds(guidesIds);
                    const config = await prisma.guideConfig.findFirst();
                    const settings = await prisma.setting.findMany();
                    
                    const pdfService = require('./pdf.service');
                    const pdfBuffer = await pdfService.generateGuidesPDF(guides, config, settings);
                    
                    return pdfBuffer;
                  }
                } catch (error) {
                  console.error('Error generating PDF:', error);
                  throw new Error(`Error al generar PDF: ${error.message}`);
                }
              }

              // ✅ NUEVO: Obtener guías por IDs
              async getGuidesByIds(ids) {
                try {
                  const guides = await prisma.guide.findMany({
                    where: { id: { in: ids } },
                    include: { sender: true }
                  });
                  return guides;
                } catch (error) {
                  console.error('Error getting guides by ids:', error);
                  throw new Error(`Error al obtener guías: ${error.message}`);
                }
              }

                    async getStatistics() {
                      try {
                        // ✅ 1. Total de guías
                        const totalGuides = await prisma.guide.count();
                        
                        // ✅ 2. Guías de hoy
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const guidesToday = await prisma.guide.count({
                          where: {
                            createdAt: {
                              gte: today
                            }
                          }
                        });
                        
                        // ✅ 3. Guías de este mes
                        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        
                        const guidesThisMonth = await prisma.guide.count({
                          where: {
                            createdAt: {
                              gte: firstDayOfMonth
                            }
                          }
                        });
                        
                        // ✅ 4. Guías pendientes
                        const pendingGuides = await prisma.guide.count({
                          where: {
                            estado: 'PENDIENTE'
                          }
                        });
                        
                        // ✅ 5. Guías por estado (usando findMany + JavaScript)
                        const allGuidesForStatus = await prisma.guide.findMany({
                          select: { estado: true }
                        });
                        
                        const guidesByStatusObj = allGuidesForStatus.reduce((acc, guide) => {
                          acc[guide.estado] = (acc[guide.estado] || 0) + 1;
                          return acc;
                        }, {});
                        
                        const guidesByStatus = Object.entries(guidesByStatusObj).map(([estado, count]) => ({
                          estado,
                          _count: count
                        }));

                        // ✅ 6. Guías por ciudad (SIN where: not null - filtrar en JS)
                        const allGuidesForCity = await prisma.guide.findMany({
                          select: { localidad: true }
                          // ❌ REMOVIDO: where: { localidad: { not: null } }
                        });
                        
                        // Filtrar null y strings vacíos en JavaScript
                        const validGuides = allGuidesForCity.filter(g => 
                          g.localidad && typeof g.localidad === 'string' && g.localidad.trim() !== ''
                        );
                        
                        const guidesByCityObj = validGuides.reduce((acc, guide) => {
                          acc[guide.localidad] = (acc[guide.localidad] || 0) + 1;
                          return acc;
                        }, {});
                        
                        const guidesByCity = Object.entries(guidesByCityObj)
                          .map(([localidad, count]) => ({ localidad, _count: count }))
                          .sort((a, b) => b._count - a._count)
                          .slice(0, 10);

                        return {
                          totalGuides,
                          guidesToday,
                          guidesThisMonth,
                          pendingGuides,
                          guidesByStatus,
                          guidesByCity
                        };
                      } catch (error) {
                        console.error('❌ Error getting statistics:', error);
                        throw new Error(`Error al obtener estadísticas: ${error.message}`);
                      }
                    }
        // ✅ AGREGAR: Actualizar estado con observación obligatoria
              async updateGuideStatus(id, status, observation, deliveryType, evidenceImage, userId) {
                try {
                  // Validar observación
                  if (!observation || observation.trim() === '') {
                    throw new Error('La observación es obligatoria al cambiar el estado');
                  }

                  // ✅ Validar evidencia para estados críticos
                  const requiresEvidence = ['ENTREGADA', 'DEVUELTA'].includes(status);
                  if (requiresEvidence && (!evidenceImage || evidenceImage.trim() === '')) {
                    throw new Error('La evidencia fotográfica es obligatoria para este estado');
                  }

                  // Obtener guía actual
                  const guide = await prisma.guide.findUnique({
                    where: { id }
                  });

                  if (!guide) {
                    throw new Error('Guía no encontrada');
                  }

                  // ✅ Preparar datos a actualizar
                  const updateData = {
                    estado: status,
                    ...(evidenceImage && { evidenceImage: evidenceImage.trim() })
                  };

                  // Actualizar estado de la guía
                  const updatedGuide = await prisma.guide.update({
                    where: { id },
                    data: updateData,
                    include: { sender: true }
                  });

                  // Registrar en historial con evidencia
                  await prisma.guideStatusHistory.create({
                    data: {
                      guideId: id,
                      previousStatus: guide.estado,
                      newStatus: status,
                      observation: observation.trim(),
                      deliveryType: deliveryType?.trim() || null,
                      evidenceImage: evidenceImage?.trim() || null,  // ✅ Guardar evidencia
                      changedBy: userId
                    }
                  });

                  return updatedGuide;
                } catch (error) {
                  console.error('Error updating guide status:', error);
                  throw new Error(`Error al actualizar estado: ${error.message}`);
                }
              }

    // ✅ AGREGAR: Obtener historial de estados de una guía
    async getGuideStatusHistory(guideId) {
      try {
        const history = await prisma.guideStatusHistory.findMany({
          where: { guideId },
          orderBy: { createdAt: 'desc' },
          include: {
            guide: {
              select: {
                guideNumber: true,
                razonSocial: true
              }
            }
          }
        });
        return history;
      } catch (error) {
        console.error('Error getting guide status history:', error);
        throw new Error(`Error al obtener historial: ${error.message}`);
      }
    }

    // ✅ AGREGAR: Obtener guías por IDs (para lotes)
      async getGuidesByIds(ids) {
        try {
          const guides = await prisma.guide.findMany({
            where: {
              id: { in: ids }
            },
            include: {
              sender: true
            }
          });
          return guides;
        } catch (error) {
          console.error('Error getting guides by ids:', error);
          throw new Error(`Error al obtener guías: ${error.message}`);
        }
      }

}



module.exports = new GuideService();