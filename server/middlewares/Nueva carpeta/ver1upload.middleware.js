const multer = require('multer');
const path = require('path');

// Usar memory storage para tener acceso al buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
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

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;