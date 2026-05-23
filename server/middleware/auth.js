const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes and verify JWT
const auth = async (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied',
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key_default_123');

    // 3. Find user and attach to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid, but user no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired',
    });
  }
};

module.exports = auth;
