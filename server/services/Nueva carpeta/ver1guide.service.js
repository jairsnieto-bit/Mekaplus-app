const { PrismaClient } = require('@prisma/client');
const PDFService = require('./pdf.service');

const prisma = new PrismaClient();

class GuideService {
  async generateGuideNumber() {
    const config = await prisma.guideConfig.findFirst();
    
    if (!config) {
      throw new Error('Guide configuration not found');
    }

    const { guidePrefix, currentNumber, guideEnd } = config;

    if (currentNumber > guideEnd) {
      throw new Error('Maximum guide number reached');
    }

    const paddedNumber = String(currentNumber).padStart(6, '0');
    const guideNumber = `${guidePrefix}-${paddedNumber}`;

    await prisma.guideConfig.update({
      where: { id: config.id },
      data: { currentNumber: currentNumber + 1 }
    });

    return guideNumber;
  }

  async createGuide(guideData, userId) {
    const guideNumber = await this.generateGuideNumber();

    const guide = await prisma.guide.create({
      data: {
        guideNumber,
        razonSocial: guideData.razonSocial,
        localidad: guideData.localidad,
        direccion: guideData.direccion,
        identificacionUsuario: guideData.identificacionUsuario,
        referenciaEntrega: guideData.referenciaEntrega,
        fechaEntrega: guideData.fechaEntrega ? new Date(guideData.fechaEntrega) : null,
        horaEntrega: guideData.horaEntrega,
        createdBy: userId
      }
    });

    return guide;
  }

  async createGuidesBulk(guidesData, userId) {
    const createdGuides = [];

    for (const guideData of guidesData) {
      const guide = await this.createGuide(guideData, userId);
      createdGuides.push(guide);
    }

    return createdGuides;
  }

  async getGuides(filters = {}) {
    const { page = 1, limit = 20, search, startDate, endDate } = filters;

    const skip = (page - 1) * limit;
    const where = {};

    if (search) {
      where.OR = [
        { guideNumber: { contains: search, mode: 'insensitive' } },
        { razonSocial: { contains: search, mode: 'insensitive' } },
        { referenciaEntrega: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [guides, total] = await Promise.all([
      prisma.guide.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.guide.count({ where })
    ]);

    return {
      guides,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async getGuideById(id) {
    const guide = await prisma.guide.findUnique({
      where: { id },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    });

    if (!guide) {
      throw new Error('Guide not found');
    }

    return guide;
  }

  async getGuideByNumber(number) {
    const guide = await prisma.guide.findUnique({
      where: { guideNumber: number },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    });

    return guide;
  }

  async updateGuide(id, guideData) {
    const guide = await prisma.guide.update({
      where: { id },
      data: guideData
    });

    return guide;
  }

  async deleteGuide(id) {
    await prisma.guide.delete({
      where: { id }
    });
    return { message: 'Guide deleted successfully' };
  }

  async generatePDF(guideIds) {
    const guides = await prisma.guide.findMany({
      where: {
        id: { in: guideIds }
      }
    });

    const config = await prisma.guideConfig.findFirst();
    const settings = await prisma.setting.findMany();

    const pdfBuffer = await PDFService.generateGuidesPDF(guides, config, settings);
    return pdfBuffer;
  }

  async getStatistics() {
    const totalGuides = await prisma.guide.count();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayGuides = await prisma.guide.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthGuides = await prisma.guide.count({
      where: {
        createdAt: {
          gte: thisMonth
        }
      }
    });

    const statusCounts = await prisma.guide.groupBy({
      by: ['estado'],
      _count: true
    });

    return {
      totalGuides,
      todayGuides,
      monthGuides,
      statusCounts
    };
  }
}

module.exports = new GuideService();