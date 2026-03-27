const dbConfigService = require('../services/dbConfig.service');
const fs = require('fs');

class DBConfigController {
  // ✅ Obtener configuración de DB
  async getDBConfig(req, res) {
    try {
      const config = await dbConfigService.getDBConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ Probar conexión
  async testDBConnection(req, res) {
    try {
      const result = await dbConfigService.testDBConnection();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ Crear backup
  async createBackup(req, res) {
    try {
      console.log('📦 Iniciando creación de backup...');
      const result = await dbConfigService.createBackup(req.user.id);
      
      res.json({
        message: 'Backup creado exitosamente',
        ...result
      });
    } catch (error) {
      console.error('❌ Error en createBackup:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ Listar backups
  async listBackups(req, res) {
    try {
      const backups = await dbConfigService.listBackups();
      res.json(backups);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ Descargar backup
  async downloadBackup(req, res) {
    try {
      const { filename } = req.params;
      const backupPath = await dbConfigService.downloadBackup(filename);
      
      res.download(backupPath, filename);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // ✅ Eliminar backup
  async deleteBackup(req, res) {
    try {
      const { filename } = req.params;
      await dbConfigService.deleteBackup(filename);
      
      res.json({ message: 'Backup eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DBConfigController();