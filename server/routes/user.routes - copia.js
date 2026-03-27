const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

// User routes are already in auth.routes.js
// This is just a placeholder for additional user-specific routes

module.exports = router;