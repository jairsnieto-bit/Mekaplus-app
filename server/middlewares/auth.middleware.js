const jwt = require('jsonwebtoken');

// ✅ Middleware: Verificar token de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ✅ NUEVO: Middleware: Verificar roles de usuario
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    // ✅ Verificar que el usuario tenga un rol
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Acceso denegado: Rol no definido' });
    }

    // ✅ Verificar si el rol del usuario está en los permitidos
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acceso denegado: Rol no autorizado',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// ✅ NUEVO: Middleware: Verificar estado del usuario (activo)
const requireActiveUser = (req, res, next) => {
  if (req.user?.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'Cuenta inactiva o bloqueada' });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,      // ✅ EXPORTAR nuevo middleware
  requireActiveUser   // ✅ EXPORTAR middleware adicional
};