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
// Agregar después de las otras rutas
const dbConfigRoutes = require('./routes/dbConfig.routes');


const app = express();

// ✅ AUMENTAR LÍMITE DE MEMORIA Y TIMEOUT
app.use((req, res, next) => {
  if (req.path.includes('/guides/download-pdf')) {
    req.setTimeout(600000); // 10 minutos (doble del actual)
    res.setTimeout(600000);
  }
  next();
});

// ✅ Aumentar límite de body para PDFs grandes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create uploads directory
createUploadsDirectory();

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
// REMOVED: app.use(express.json()); - ya está arriba con límite
// REMOVED: app.use(express.urlencoded()); - ya está arriba con límite

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/config', configRoutes);
app.use('/api/senders', senderRoutes);
app.use('/api/config', dbConfigRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads\n`);
  console.log(`⚙️  Memory limit: 50MB`);
  console.log(`⏱️  Timeout: 600000ms (10 min)\n`);

  console.log('🔧 [ENV] DB_HOST:', process.env.DB_HOST);
console.log('🔧 [ENV] DB_PORT:', process.env.DB_PORT);
console.log('🔧 [ENV] DB_NAME:', process.env.DB_NAME);
console.log('🔧 [ENV] DB_USER:', process.env.DB_USER);
console.log('🔧 [ENV] DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ No set');
});

module.exports = app;