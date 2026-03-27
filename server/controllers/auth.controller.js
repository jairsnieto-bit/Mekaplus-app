const userService = require('../services/user.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
  // ✅ LOGIN
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const user = await userService.findUserByEmail(email);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      if (user.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Cuenta inactiva o bloqueada' });
      }

      // ✅ Actualizar último login
      await userService.updateLastLogin(user.id);

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login exitoso',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }

  // ✅ REGISTER
  async register(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
      }

      const user = await userService.createUser({
        name,
        email,
        phone,
        password,
        role: 'OPERATOR',
        status: 'ACTIVE'
      });

      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error en register:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // ✅ GET PROFILE
  async getProfile(req, res) {
    try {
      const user = await userService.getUserById(req.user.id);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  }

  // ✅ UPDATE PROFILE
  async updateProfile(req, res) {
    try {
      const { name, email, phone } = req.body;
      
      const user = await userService.updateUser(req.user.id, {
        name,
        email,
        phone
      }, req.user.id);

      const { password, ...userWithoutPassword } = user;
      res.json({ message: 'Perfil actualizado', user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // ✅ CHANGE PASSWORD
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Contraseñas son requeridas' });
      }

      const user = await userService.findUserByEmail(req.user.email);
      
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
      }

      await userService.updateUser(req.user.id, {
        password: newPassword
      }, req.user.id);

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();