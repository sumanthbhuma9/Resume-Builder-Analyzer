const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login a user and return token
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/profile
// @desc    Get current user profile details
// @access  Private (Secured via auth middleware)
router.get('/profile', auth, getProfile);

module.exports = router;
