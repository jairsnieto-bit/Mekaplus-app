const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authenticateToken, authorize('ADMIN'), authController.getAllUsers);
router.get('/users/:id', authenticateToken, authController.getUserById);
router.put('/users/:id', authenticateToken, authorize('ADMIN'), authController.updateUser);
router.delete('/users/:id', authenticateToken, authorize('ADMIN'), authController.deleteUser);

module.exports = router;