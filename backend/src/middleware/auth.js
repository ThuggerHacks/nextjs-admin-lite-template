const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        department: true,
        supervisor: true,
        sucursal: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account not active' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireSupervisor = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role === 'SUPERVISOR' || req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN' || req.user.role === 'DEVELOPER') {
    next();
  } else {
    return res.status(403).json({ error: 'Supervisor access required' });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireSupervisor
}; 