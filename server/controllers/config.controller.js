const configService = require('../services/config.service');
const path = require('path');
const fs = require('fs').promises;

class ConfigController {
  async getGuideConfig(req, res) {
    try {
      const config = await configService.getGuideConfig();
      res.json(config);
    } catch (error) {
      console.error('Error getting guide config:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateGuideConfig(req, res) {
    try {
      const config = await configService.updateGuideConfig(req.body);
      res.json(config);
    } catch (error) {
      console.error('Error updating guide config:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async uploadLogo(req, res) {
  try {
    console.log('=== UPLOAD LOGO ===');
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    // ✅ Construir URL completa del logo
    const logoUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    
    console.log('Logo URL:', logoUrl);

    // Actualizar configuración con la URL completa
    const config = await configService.updateGuideConfig({
      logo: logoUrl
    });

    res.json({
      message: 'Logo subido exitosamente',
      logo: logoUrl,
      config: config
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ 
      error: 'Error al subir el logo',
      details: error.message 
    });
  }
}

  /*async uploadLogo(req, res) {
    try {
      console.log('=== UPLOAD LOGO ===');
      console.log('File:', req.file);
      console.log('Body:', req.body);

      if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
      }

      // Construir URL del logo
      const logoPath = `/uploads/${req.file.filename}`;
      console.log('Logo path:', logoPath);

      // Actualizar configuración con el nuevo logo
      const config = await configService.updateGuideConfig({
        logo: logoPath
      });

      console.log('Config updated:', config);

      res.json({
        message: 'Logo subido exitosamente',
        logo: logoPath,
        config: config
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      res.status(500).json({ 
        error: 'Error al subir el logo',
        details: error.message 
      });
    }
  }*/

  async resetGuideNumber(req, res) {
    try {
      const config = await configService.resetGuideNumber();
      res.json({
        message: 'Numeración reiniciada',
        currentNumber: config.currentNumber
      });
    } catch (error) {
      console.error('Error resetting guide number:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getSettings(req, res) {
    try {
      const settings = await configService.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error getting settings:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateSetting(req, res) {
    try {
      const { key, value, type, description } = req.body;
      const setting = await configService.updateSetting(key, value, type, description);
      res.json(setting);
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ConfigController();