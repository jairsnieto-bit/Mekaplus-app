const configService = require('../services/config.service');
const path = require('path');
const fs = require('fs').promises;

class ConfigController {
  async getGuideConfig(req, res) {
    try {
      const config = await configService.getGuideConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateGuideConfig(req, res) {
    try {
      const config = await configService.updateGuideConfig(req.body);
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async uploadLogo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const logoPath = `/uploads/${req.file.filename}`;
      const config = await configService.uploadLogo(logoPath);
      
      res.json({
        message: 'Logo uploaded successfully',
        logo: logoPath
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async resetGuideNumber(req, res) {
    try {
      const config = await configService.resetGuideNumber();
      res.json({
        message: 'Guide number reset successfully',
        currentNumber: config.currentNumber
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSettings(req, res) {
    try {
      const settings = await configService.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateSetting(req, res) {
    try {
      const { key, value, type, description } = req.body;
      const setting = await configService.updateSetting(key, value, type, description);
      res.json(setting);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ConfigController();