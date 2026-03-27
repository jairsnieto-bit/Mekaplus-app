const express = require('express');
const router = express.Router();
const senderController = require('../controllers/sender.controller');

// ✅ Intentar cargar middleware de autenticación
let authenticateToken;
try {
  const authModule = require('../middlewares/auth.middleware');
  authenticateToken = authModule.authenticateToken;
} catch (error) {
  console.log('⚠️ Middleware de auth no encontrado - Algunas rutas serán públicas');
}

// ✅ Rutas PÚBLICAS (sin autenticación) - Deben ir PRIMERO
router.get('/active', senderController.getActiveSenders);

// ✅ Rutas PROTEGIDAS (con autenticación si existe)
if (authenticateToken) {
  router.use(authenticateToken);
}

router.get('/', senderController.getSenders);
router.get('/:id', senderController.getSenderById);
router.post('/', senderController.createSender);
router.put('/:id', senderController.updateSender);
router.delete('/:id', senderController.deleteSender);

module.exports = router;