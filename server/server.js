const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// ✅ PUERTO CORRECTO (Railway)
const PORT = process.env.PORT || 10000;

// ✅ CREAR CARPETA UPLOADS (FIX CRASH RAILWAY)
const uploadPath = path.join(__dirname, 'uploads');

try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('📁 Carpeta uploads creada');
  } else {
    console.log('📁 Carpeta uploads ya existe');
  }
} catch (error) {
  console.error('❌ Error creando carpeta uploads:', error.message);
}

const app = express();
console.log('🔥 VERSION CORS NUEVA ACTIVA');

// ✅ TIMEOUT SOLO PARA PDF
app.use((req, res, next) => {
  if (req.path.includes('/guides/download-pdf')) {
    req.setTimeout(600000);
    res.setTimeout(600000);
  }
  next();
});

// ✅ BODY GRANDE
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ STATIC FILES
app.use('/uploads', express.static(uploadPath));

// ✅ CORS — bulletproof for Vercel dynamic preview URLs
//const VERCEL_PATTERN = /\.vercel\.app$/;
const VERCEL_PATTERN = /\.vercel\.app$/;
const RAILWAY_PATTERN = /\.railway\.app$/;

const allowedOrigins = [
  'http://localhost:5173',   // Vite dev server
  'http://localhost:3000',   // alternative dev
  process.env.FRONTEND_URL, // custom domain via env var
].filter(Boolean);

/*function isOriginAllowed(origin) {
  // No origin header → mobile apps, curl, server-to-server — always allow
  if (!origin) return true;

  console.log(`🌐 [CORS] Checking origin: ${origin}`);

  // Exact match against the static allow-list
  if (allowedOrigins.includes(origin)) {
    console.log(`✅ [CORS] Allowed (exact match): ${origin}`);
    return true;
  }

  // Any *.vercel.app URL — covers production + every preview deployment
  if (VERCEL_PATTERN.test(origin)) {
    console.log(`✅ [CORS] Allowed (*.vercel.app): ${origin}`);
    return true;
  }

  console.log(`❌ [CORS] Blocked: ${origin}`);
  return false;
}*/
function isOriginAllowed(origin) {
  if (!origin) return true;

  console.log(`🌐 [CORS] Checking origin: ${origin}`);

  if (allowedOrigins.includes(origin)) {
    console.log(`✅ [CORS] Allowed (exact match): ${origin}`);
    return true;
  }

  if (VERCEL_PATTERN.test(origin)) {
    console.log(`✅ [CORS] Allowed (*.vercel.app): ${origin}`);
    return true;
  }

  // ✅ NUEVO: permitir Railway
  if (RAILWAY_PATTERN.test(origin)) {
    console.log(`✅ [CORS] Allowed (*.railway.app): ${origin}`);
    return true;
  }

  console.log(`❌ [CORS] Blocked: ${origin}`);
  return false;
}

/*app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
}));*/
// ✅ CORS SIMPLE Y EFECTIVO (Railway)
/*app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://mekaplus-frontend.up.railway.app'
  ],
  credentials: true
}));*/

///////
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log('✅ Conectado a Supabase'))
  .catch(err => console.error('❌ Error Supabase:', err));*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    console.log('✅ CONEXIÓN EXITOSA A SUPABASE');
  } catch (error) {
    console.error('❌ ERROR REAL:', error.message);
  }
});
console.log('🌍 DATABASE_URL:', process.env.DATABASE_URL ? '✅ CARGADA' : '❌ NO EXISTE');
///////

// Handle pre-flight requests for all routes
/*app.options('*', cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
}));*/
app.use(cors({
  origin: true,
  credentials: true
}));

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

// ✅ HEALTH CHECK (CLAVE)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ✅ LOG DE ARRANQUE
console.log('🚀 Iniciando servidor...');

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`✅ Server corriendo en puerto ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`⚙️ Memory limit: 50MB`);
  console.log(`⏱️ Timeout: 600000ms (10 min)`);

  // DEBUG ENV
  console.log('🔧 [ENV] DB_HOST:', process.env.DB_HOST);
  console.log('🔧 [ENV] DB_PORT:', process.env.DB_PORT);
  console.log('🔧 [ENV] DB_NAME:', process.env.DB_NAME);
  console.log('🔧 [ENV] DB_USER:', process.env.DB_USER);
  console.log('🔧 [ENV] DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ No set');
});

module.exports = app;
