const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const createUploadsDirectory = require('./utils/createUploadsDir');

dotenv.config();

const authRoutes = require('./routes/auth.routes');
const guideRoutes = require('./routes/guide.routes');
const userRoutes = require('./routes/user.routes');
const settingRoutes = require('./routes/setting.routes');
const configRoutes = require('./routes/config.routes');
const senderRoutes = require('./routes/sender.routes');

const app = express();

// ✅ Aumentar timeout para PDFs grandes
app.use((req, res, next) => {
  if (req.path.includes('/guides/download-pdf')) {
    req.setTimeout(300000); // 5 minutos
    res.setTimeout(300000);
  }
  next();
});

// Create uploads directory
createUploadsDirectory();

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/config', configRoutes);
app.use('/api/senders', senderRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads\n`);
});

module.exports = app;