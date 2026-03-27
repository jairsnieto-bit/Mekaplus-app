const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code) {
    if (err.code === 'P2002') {
      return res.status(409).json({ 
        message: 'Ya existe un registro con ese valor único' 
      });
    }
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: 'Error en la subida del archivo' });
  }

  // JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'JSON inválido' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;