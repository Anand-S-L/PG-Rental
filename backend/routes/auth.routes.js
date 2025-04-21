const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Authentication routes (no auth required)
router.post('/login', authController.login);
router.post('/register', authController.register);

// Routes requiring authentication
router.get('/me', authMiddleware.verifyToken, authController.getCurrentUser);
router.post('/change-password', authMiddleware.verifyToken, authController.changePassword);

module.exports = router;