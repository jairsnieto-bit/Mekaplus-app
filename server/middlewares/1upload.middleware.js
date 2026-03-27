const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ NUEVO: Crear carpeta específica para evidencias
const evidenceDir = path.join(uploadsDir, 'evidence');
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

// ============================================
// ✅ STORAGE PARA LOGOS
// ============================================
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ============================================
// ✅ NUEVO: STORAGE PARA EVIDENCIAS FOTOGRÁFICAS
// ============================================
const evidenceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, evidenceDir);  // ✅ Guardar en carpeta evidence/
  },
  filename: (req, file, cb) => {
    const guideId = req.params.id || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `evidence-${guideId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// ============================================
// ✅ FILE FILTER PARA IMÁGENES
// ============================================
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;  // ✅ Sin SVG para evidencias
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
  }
};

// ============================================
// ✅ FILE FILTER PARA EXCEL
// ============================================
const excelFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls'];
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/excel',
    'application/x-excel',
    'application/x-msexcel'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  
  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(mimeType)) {
    cb(null, true);
  } else {
    cb(new Error(`El archivo "${file.originalname}" no es un archivo Excel válido. Use .xlsx o .xls`));
  }
};

// ============================================
// ✅ MIDDLEWARES EXPORTADOS (SIN DUPLICADOS)
// ============================================

// ✅ Para logos
const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
  fileFilter: imageFileFilter
});

// ✅ NUEVO: Para evidencias fotográficas
const uploadEvidence = multer({
  storage: evidenceStorage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB máximo
  fileFilter: imageFileFilter
});

// ✅ Para Excel (SIN DUPLICAR)
const uploadExcel = multer({
  storage: multer.memoryStorage(),  // Excel en memoria
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
  fileFilter: excelFileFilter
});

// ✅ Exportar TODOS los middlewares (una sola vez)
module.exports = {
  uploadLogo,
  uploadExcel,
  uploadEvidence  // ✅ NUEVO: Exportar middleware de evidencia
};




/*const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ NUEVO: Crear carpeta específica para evidencias
const evidenceDir = path.join(uploadsDir, 'evidence');
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

// Storage configuration para logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ✅ NUEVO: Storage para evidencias fotográficas
const evidenceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, evidenceDir);
  },
  filename: (req, file, cb) => {
    const guideId = req.params.id || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `evidence-${guideId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filter para aceptar solo imágenes
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;  // ✅ Sin SVG para evidencias
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
  }
};

// Filter para archivos Excel
const excelFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls'];
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/excel',
    'application/x-excel',
    'application/x-msexcel'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  
  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(mimeType)) {
    cb(null, true);
  } else {
    cb(new Error(`El archivo "${file.originalname}" no es un archivo Excel válido. Use .xlsx o .xls`));
  }
};

// Middlewares exportados
const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB para logos
  fileFilter: imageFileFilter
});

// ✅ NUEVO: Middleware para evidencias fotográficas
const uploadEvidence = multer({
  storage: evidenceStorage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB máximo
  fileFilter: imageFileFilter
});

const uploadExcel = multer({
  storage: multer.memoryStorage(), // Excel en memoria para procesamiento
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB para Excel
  fileFilter: excelFileFilter
});

module.exports = {
  uploadLogo,
  uploadExcel,
  uploadEvidence  // ✅ NUEVO: Exportar middleware de evidencia
};*/



/*const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ NUEVO: Crear carpeta específica para evidencias
const evidenceDir = path.join(uploadsDir, 'evidence');
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

// ============================================
// ✅ STORAGE PARA LOGOS (EXISTENTE - SIN CAMBIOS)
// ============================================
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ============================================
// ✅ NUEVO: STORAGE PARA EVIDENCIAS FOTOGRÁFICAS
// ============================================
const evidenceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, evidenceDir);  // ✅ Guardar en carpeta evidence/
  },
  filename: (req, file, cb) => {
    // ✅ Nombre único: evidence-timestamp-guidId-extension
    const guideId = req.params.id || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `evidence-${guideId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// ============================================
// ✅ FILE FILTER PARA IMÁGENES (REUTILIZABLE)
// ============================================
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;  // ✅ Sin SVG para evidencias (más estricto)
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
  }
};

// ============================================
// ✅ FILE FILTER PARA EXCEL (EXISTENTE - SIN CAMBIOS)
// ============================================
const excelFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls'];
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/excel',
    'application/x-excel',
    'application/x-msexcel'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  
  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(mimeType)) {
    cb(null, true);
  } else {
    cb(new Error(`El archivo "${file.originalname}" no es un archivo Excel válido. Use .xlsx o .xls`));
  }
};

// ============================================
// ✅ MIDDLEWARES EXPORTADOS
// ============================================

// ✅ EXISTENTE: Para logos (SIN CAMBIOS)
const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
  fileFilter: imageFileFilter
});

// ✅ NUEVO: Para evidencias fotográficas de estado
const uploadEvidence = multer({
  storage: evidenceStorage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB máximo
  fileFilter: imageFileFilter
});

// ✅ EXISTENTE: Para Excel (SIN CAMBIOS)
const uploadExcel = multer({
  storage: multer.memoryStorage(),  // Excel en memoria
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
  fileFilter: excelFileFilter
});

module.exports = {
  uploadLogo,
  uploadExcel,
  uploadEvidence  // ✅ NUEVO: Exportar middleware de evidencia
};*/