const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// ✅ Rutas PÚBLICAS de autenticación
router.post('/login', authController.login);
router.post('/register', authController.register);

// ✅ Rutas PROTEGIDAS de autenticación (perfil del usuario)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/password', authenticateToken, authController.changePassword);

// ✅ NO AGREGAR rutas de gestión de usuarios aquí
// Esas van en user.routes.js

module.exports = router;