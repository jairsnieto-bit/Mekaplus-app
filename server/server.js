const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// ✅ PUERTO (Railway usa process.env.PORT)
const PORT = process.env.PORT || 8080;

// ✅ DEBUG ENV
console.log('🌍 DATABASE_URL:', process.env.DATABASE_URL ? '✅ CARGADA' : '❌ NO EXISTE');

// ✅ PRISMA (CONEXIÓN REAL)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    console.log('✅ CONEXIÓN EXITOSA A SUPABASE');
  } catch (error) {
    console.error('❌ ERROR SUPABASE:', error.message);
  }
})();

// ✅ CREAR CARPETA UPLOADS
const uploadPath = path.join(__dirname, 'uploads');

try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('📁 Carpeta uploads creada');
  } else {
    console.log('📁 Carpeta uploads ya existe');
  }
} catch (error) {
  console.error('❌ Error creando uploads:', error.message);
}

// ✅ TIMEOUT SOLO PARA PDF
app.use((req, res, next) => {
  if (req.path.includes('/guides/download-pdf')) {
    req.setTimeout(600000);
    res.setTimeout(600000);
  }
  next();
});

// ✅ BODY PARSER
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ STATIC FILES
app.use('/uploads', express.static(uploadPath));

// ✅ CORS SIMPLE Y SEGURO (SOLUCIONA TU ERROR)
/*app.use(cors({
  origin: true, // permite cualquier frontend (Railway, local, etc)
  credentials: true
}));*/
const cors = require('cors');

app.use(cors({
  origin: 'https://mekaplus-frontend.up.railway.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 🔥 ESTA LÍNEA ES LA CLAVE
app.options('*', cors());

console.log('🔥 CORS ACTIVO Y FUNCIONANDO');

// ✅ IMPORTAR RUTAS
const authRoutes = require('./routes/auth.routes');
const guideRoutes = require('./routes/guide.routes');
const userRoutes = require('./routes/user.routes');
const settingRoutes = require('./routes/setting.routes');
const configRoutes = require('./routes/config.routes');
const senderRoutes = require('./routes/sender.routes');
const dbConfigRoutes = require('./routes/dbConfig.routes');

// ✅ USAR RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/config', configRoutes);
app.use('/api/senders', senderRoutes);
app.use('/api/config', dbConfigRoutes);

// ✅ HEALTH CHECK (IMPORTANTE PARA RAILWAY)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ✅ LOG INICIO
console.log('🚀 Iniciando servidor...');

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`⚙️ Memory limit: 50MB`);
  console.log(`⏱️ Timeout: 600000ms (10 min)`);
});

module.exports = app;
