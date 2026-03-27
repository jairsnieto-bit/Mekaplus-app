const senderService = require('../services/sender.service');

class SenderController {
  async getSenders(req, res) {
    try {
      const { page, limit, search, isActive } = req.query;
      const result = await senderService.getSenders({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search,
        isActive: isActive === 'true' || isActive === 'false' ? isActive === 'true' : undefined
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSenderById(req, res) {
    try {
      const sender = await senderService.getSenderById(req.params.id);
      res.json(sender);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async createSender(req, res) {
    try {
      const sender = await senderService.createSender(req.body);
      res.status(201).json(sender);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateSender(req, res) {
    try {
      const sender = await senderService.updateSender(req.params.id, req.body);
      res.json(sender);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteSender(req, res) {
    try {
      const result = await senderService.deleteSender(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getActiveSenders(req, res) {
    try {
      const senders = await senderService.getActiveSenders();
      res.json(senders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SenderController();