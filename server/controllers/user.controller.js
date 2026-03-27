const userService = require('../services/user.service');

class UserController {
  // ✅ CREAR usuario
  async createUser(req, res) {
    try {
      const { name, email, phone, role, status, password } = req.body;

      // Validaciones básicas
      if (!name || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
      }

      const user = await userService.createUser({
        name,
        email,
        phone,
        role,
        status,
        password
      }, req.user.id);

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user
      });
    } catch (error) {
      console.error('Error en createUser:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // ✅ LISTAR usuarios
  async getUsers(req, res) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        search: req.query.search || '',
        role: req.query.role || '',
        status: req.query.status || '',
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await userService.getUsers(filters);
      res.json(result);
    } catch (error) {
      console.error('Error en getUsers:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ OBTENER usuario por ID
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // ✅ ACTUALIZAR usuario
  async updateUser(req, res) {
    try {
      const { name, email, phone, role, status, password } = req.body;

      const user = await userService.updateUser(req.params.id, {
        name,
        email,
        phone,
        role,
        status,
        password
      }, req.user.id);

      res.json({
        message: 'Usuario actualizado exitosamente',
        user
      });
    } catch (error) {
      console.error('Error en updateUser:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // ✅ ELIMINAR usuario (soft delete)
  async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.id, req.user.id);
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error en deleteUser:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // ✅ CAMBIAR estado del usuario
  async toggleUserStatus(req, res) {
    try {
      const { status } = req.body;

      if (!status || !['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(status)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      const user = await userService.toggleUserStatus(req.params.id, status, req.user.id);
      res.json({
        message: 'Estado actualizado correctamente',
        user
      });
    } catch (error) {
      console.error('Error en toggleUserStatus:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // ✅ OBTENER logs de auditoría
  async getAuditLogs(req, res) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        userId: req.query.userId || '',
        action: req.query.action || '',
        module: req.query.module || ''
      };

      const result = await userService.getAuditLogs(filters);
      res.json(result);
    } catch (error) {
      console.error('Error en getAuditLogs:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();