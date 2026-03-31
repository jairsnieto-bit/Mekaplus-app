const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

class UserService {
  // ✅ CREAR usuario con validaciones
  async createUser(data, createdBy) {
    try {
      // Validar email único
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // ✅ Generar contraseña segura si no se proporciona
      const password = data.password || this.generateSecurePassword();
      const hashedPassword = await bcrypt.hash(password, 12);

      // ✅ Crear usuario
      const user = await prisma.user.create({
        data: {
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          phone: data.phone?.trim() || null,
          password: hashedPassword,
          role: data.role || 'OPERATOR',
          status: data.status || 'ACTIVE',
          //createdBy: createdBy
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true
        }
      });

      // ✅ Registrar en auditoría
      await this.createAuditLog(createdBy, 'CREATE', 'USERS', 
        `Usuario creado: ${user.email}`, { userId: user.id });

      return { ...user, password }; // Retornar contraseña para envío por email
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  // ✅ LISTAR usuarios con filtros, búsqueda y paginación
  async getUsers(filters) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search = '', 
        role = '', 
        status = '',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        deletedAt: null // ✅ Soft delete: solo usuarios no eliminados
      };

      // ✅ Búsqueda por nombre o email
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      // ✅ Filtro por rol
      if (role) {
        where.role = role;
      }

      // ✅ Filtro por estado
      if (status) {
        where.status = status;
      }

      // ✅ Ordenamiento
      const orderBy = {
        [sortBy]: sortOrder
      };

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            createdAt: true,
            lastLoginAt: true
          }
        }),
        prisma.user.count({ where })
      ]);

      return {
        users,
        page,
        totalPages: Math.ceil(total / limit),
        total
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  // ✅ OBTENER usuario por ID
  async getUserById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id, deletedAt: null },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true
        }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  // ✅ ACTUALIZAR usuario
  async updateUser(id, data, updatedBy) {
    try {
      // Verificar que el usuario existe
      const existingUser = await prisma.user.findUnique({
        where: { id, deletedAt: null }
      });

      if (!existingUser) {
        throw new Error('Usuario no encontrado');
      }

      // ✅ Validar email único (si se cambia)
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: data.email.toLowerCase() }
        });

        if (emailExists) {
          throw new Error('El email ya está registrado');
        }
      }

      // ✅ Preparar datos de actualización
      const updateData = {
        name: data.name?.trim(),
        email: data.email?.toLowerCase().trim(),
        phone: data.phone?.trim(),
        role: data.role,
        status: data.status
      };

      // ✅ Hash de contraseña si se cambia
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 12);
      }

      // ✅ Actualizar usuario
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          updatedAt: true
        }
      });

      // ✅ Registrar en auditoría
      await this.createAuditLog(updatedBy, 'UPDATE', 'USERS', 
        `Usuario actualizado: ${user.email}`, { 
          userId: user.id,
          changes: Object.keys(updateData)
        });

      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  // ✅ ELIMINACIÓN LÓGICA (Soft Delete)
  async deleteUser(id, deletedBy) {
    try {
      // Verificar que el usuario existe
      const existingUser = await prisma.user.findUnique({
        where: { id, deletedAt: null }
      });

      if (!existingUser) {
        throw new Error('Usuario no encontrado');
      }

      // ✅ No permitir eliminar el último admin
      if (existingUser.role === 'ADMIN') {
        const adminCount = await prisma.user.count({
          where: { role: 'ADMIN', deletedAt: null }
        });

        if (adminCount <= 1) {
          throw new Error('No se puede eliminar el último administrador');
        }
      }

      // ✅ Soft delete: marcar como eliminado
      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      // ✅ Registrar en auditoría
      await this.createAuditLog(deletedBy, 'DELETE', 'USERS', 
        `Usuario eliminado: ${existingUser.email}`, { 
          userId: id,
          userEmail: existingUser.email
        });

      return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  // ✅ CAMBIAR estado del usuario (Activar/Desactivar)
  async toggleUserStatus(id, newStatus, changedBy) {
    try {
      const user = await prisma.user.update({
        where: { id, deletedAt: null },
        data: { status: newStatus },
        select: {
          id: true,
          name: true,
          email: true,
          status: true
        }
      });

      // ✅ Registrar en auditoría
      await this.createAuditLog(changedBy, 'UPDATE', 'USERS', 
        `Estado cambiado: ${user.email} -> ${newStatus}`, { 
          userId: user.id,
          newStatus
        });

      return user;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }

  // ✅ REGISTRAR último login
  async updateLastLogin(userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() }
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // ✅ CREAR registro de auditoría
  async createAuditLog(userId, action, module, description, metadata = {}) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          module,
          description,
          metadata
        }
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  // ✅ GENERAR contraseña segura
  generateSecurePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // ✅ OBTENER logs de auditoría
  async getAuditLogs(filters) {
    try {
      const { page = 1, limit = 50, userId = '', action = '', module = '' } = filters;

      const where = {};

      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (module) where.module = module;

      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }),
        prisma.auditLog.count({ where })
      ]);

      return {
        logs,
        page,
        totalPages: Math.ceil(total / limit),
        total
      };
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw new Error(`Error al obtener logs: ${error.message}`);
    }
  }

  // ✅ Agregar este método en UserService
/*async findUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase(),
        deletedAt: null 
      }
    });
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw new Error(`Error al buscar usuario: ${error.message}`);
  }
}*/
  async findUserByEmail(email) {
  try {
    const user = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase(),
        deletedAt: null
      }
    });

    return user;
  } catch (error) {
    console.error('💥 Error finding user by email:', error);
    throw new Error(`Error al buscar usuario: ${error.message}`);
  }
}


}

module.exports = new UserService();
