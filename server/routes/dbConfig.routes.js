const express = require('express');
const router = express.Router();
const dbConfigController = require('../controllers/dbConfig.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// ============================================
// ✅ RUTAS DE CONFIGURACIÓN DE DB
// ============================================
router.get('/db/config', authenticateToken, dbConfigController.getDBConfig);
router.post('/db/test', authenticateToken, dbConfigController.testDBConnection);

// ============================================
// ✅ RUTAS DE BACKUPS
// ============================================

// ✅ Rutas específicas (sin parámetros dinámicos) - PRIMERO
router.post('/backup/create', authenticateToken, dbConfigController.createBackup);
router.get('/backup/list', authenticateToken, dbConfigController.listBackups);

// ✅ Endpoint de test CON autenticación (SOLO antes de rutas con :param)
router.get('/backup/test', authenticateToken, async (req, res) => {
  // ✅ Opcional: Solo permitir admin en producción
  if (process.env.NODE_ENV === 'production' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    const { stdout } = await execPromise('pg_dump --version');
    
    res.json({
      'pg_dump': '✅ Instalado',
      version: stdout.trim(),
      message: 'pg_dump está disponible',
      requestedBy: req.user?.email || 'unknown',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      'pg_dump': '❌ Error',
      error: error.message
    });
  }
});

// ✅ Rutas con parámetros dinámicos - SIEMPRE AL FINAL
router.get('/backup/download/:filename', authenticateToken, dbConfigController.downloadBackup);
router.delete('/backup/:filename', authenticateToken, dbConfigController.deleteBackup);

// ✅ EXPORTAR ROUTER - SIEMPRE AL FINAL DEL ARCHIVO
module.exports = router;




/*const express = require('express');
const router = express.Router();
const dbConfigController = require('../controllers/dbConfig.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// ✅ Rutas de Configuración de DB
router.get('/db/config', authenticateToken, dbConfigController.getDBConfig);
router.post('/db/test', authenticateToken, dbConfigController.testDBConnection);

// ✅ Rutas de Backups
router.post('/backup/create', authenticateToken, dbConfigController.createBackup);
router.get('/backup/list', authenticateToken, dbConfigController.listBackups);
router.get('/backup/download/:filename', authenticateToken, dbConfigController.downloadBackup);
router.delete('/backup/:filename', authenticateToken, dbConfigController.deleteBackup);

// ✅ Ruta de prueba para verificar pg_dump
router.get('/backup/test', authenticateToken, async (req, res) => {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    // Probar pg_dump
    const { stdout } = await execPromise('pg_dump --version');
    
    res.json({
      pg_dump: '✅ Instalado',
      version: stdout.trim()
    });
  } catch (error) {
    res.status(500).json({
      pg_dump: '❌ No instalado',
      error: error.message
    });
  }
});

module.exports = router;*/
/*
const express = require('express');
const router = express.Router();
const dbConfigController = require('../controllers/dbConfig.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// ✅ Rutas de Configuración de DB (con auth)
router.get('/db/config', authenticateToken, dbConfigController.getDBConfig);
router.post('/db/test', authenticateToken, dbConfigController.testDBConnection);

// ✅ Rutas de Backups (con auth)
router.post('/backup/create', authenticateToken, dbConfigController.createBackup);
router.get('/backup/list', authenticateToken, dbConfigController.listBackups);
router.get('/backup/download/:filename', authenticateToken, dbConfigController.downloadBackup);
router.delete('/backup/:filename', authenticateToken, dbConfigController.deleteBackup);

// ✅ NUEVO: Endpoint de test para verificar pg_dump (SIN AUTH - solo desarrollo)
router.get('/backup/test', async (req, res) => {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    // Probar pg_dump
    const { stdout } = await execPromise('pg_dump --version');
    
    res.json({
      'pg_dump': '✅ Instalado',
      version: stdout.trim(),
      message: 'pg_dump está disponible para crear backups'
    });
  } catch (error) {
    res.status(500).json({
      'pg_dump': '❌ No instalado',
      error: error.message,
      message: 'Instala PostgreSQL o pg_dump para crear backups'
    });
  }
});

module.exports = router;*/
