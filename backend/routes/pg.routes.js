const express = require('express');
const pgController = require('../controllers/pg.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', pgController.findAll);
router.get('/:id', pgController.findOne);

// Admin-only routes
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, pgController.create);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, pgController.update);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, pgController.delete);

module.exports = router;
