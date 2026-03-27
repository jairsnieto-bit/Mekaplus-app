const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, configController.getSettings);
router.put('/', authenticateToken, authorize('ADMIN'), configController.updateSetting);

module.exports = router;