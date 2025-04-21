const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Routes requiring admin access
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAllUsers);

// Routes requiring authentication and ownership
router.get('/:id', authMiddleware.verifyToken, userController.getUserById);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isOwnerOrAdmin, userController.updateUser);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isOwnerOrAdmin, userController.deleteUser);

// Profile route
router.get('/profile/me', authMiddleware.verifyToken, userController.getProfile);

module.exports = router;