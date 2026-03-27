const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SenderService {
  async getSenders(filters = {}) {
    try {
      const { page = 1, limit = 20, search, isActive } = filters;

      const where = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { nit: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const skip = (page - 1) * limit;

      const [senders, total] = await Promise.all([
        prisma.sender.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' }
        }),
        prisma.sender.count({ where })
      ]);

      return {
        senders,
        page,
        totalPages: Math.ceil(total / limit),
        total
      };
    } catch (error) {
      console.error('Error getting senders:', error);
      throw new Error(`Error al obtener remitentes: ${error.message}`);
    }
  }

  async getSenderById(id) {
    try {
      const sender = await prisma.sender.findUnique({
        where: { id }
      });

      if (!sender) {
        throw new Error('Remitente no encontrado');
      }

      return sender;
    } catch (error) {
      console.error('Error getting sender by id:', error);
      throw new Error(`Error al obtener remitente: ${error.message}`);
    }
  }

  async createSender(data) {
    try {
      const sender = await prisma.sender.create({
        data: {
          name: data.name,
          nit: data.nit,
          address: data.address,
          phone: data.phone,
          email: data.email,
          department: data.department,
          isActive: data.isActive !== false
        }
      });

      return sender;
    } catch (error) {
      console.error('Error creating sender:', error);
      throw new Error(`Error al crear remitente: ${error.message}`);
    }
  }

  async updateSender(id, data) {
    try {
      const sender = await prisma.sender.update({
        where: { id },
        data: {
          name: data.name,
          nit: data.nit,
          address: data.address,
          phone: data.phone,
          email: data.email,
          department: data.department,
          isActive: data.isActive
        }
      });

      return sender;
    } catch (error) {
      console.error('Error updating sender:', error);
      throw new Error(`Error al actualizar remitente: ${error.message}`);
    }
  }

  async deleteSender(id) {
    try {
      // Soft delete: desactivar en lugar de eliminar
      await prisma.sender.update({
        where: { id },
        data: { isActive: false }
      });

      return { message: 'Remitente desactivado correctamente' };
    } catch (error) {
      console.error('Error deleting sender:', error);
      throw new Error(`Error al eliminar remitente: ${error.message}`);
    }
  }

  async getActiveSenders() {
    try {
      const senders = await prisma.sender.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          nit: true
        }
      });
      return senders;
    } catch (error) {
      console.error('Error getting active senders:', error);
      throw new Error(`Error al obtener remitentes activos: ${error.message}`);
    }
  }
}

module.exports = new SenderService();