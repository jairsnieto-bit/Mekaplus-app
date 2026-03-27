const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// ✅ Todas las rutas requieren autenticación
router.use(authenticateToken);

// ✅ Rutas de usuarios
router.get('/', authorizeRole(['ADMIN']), userController.getUsers);
router.post('/', authorizeRole(['ADMIN']), userController.createUser);
//router.get('/:id', userController.getUserById);
router.get('/:id', authorizeRole(['ADMIN']), userController.getUserById);
router.put('/:id', authorizeRole(['ADMIN']), userController.updateUser);
router.delete('/:id', authorizeRole(['ADMIN']), userController.deleteUser);

// ✅ Ruta para cambiar estado (disponible para ADMIN y OPERATOR senior)
router.put('/:id/status', authorizeRole(['ADMIN', 'OPERATOR']), userController.toggleUserStatus);

// ✅ Rutas de auditoría (solo ADMIN)
router.get('/audit/logs', authorizeRole(['ADMIN']), userController.getAuditLogs);

// ✅ Endpoint de test para verificar authorizeRole (eliminar en producción)
router.get('/test/roles', authenticateToken, authorizeRole(['ADMIN']), (req, res) => {
  res.json({
    message: '✅ Middleware authorizeRole funcionando',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;