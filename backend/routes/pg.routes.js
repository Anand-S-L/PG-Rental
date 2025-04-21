const express = require('express');
const pgController = require('../controllers/pg.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', pgController.findAll);
router.get('/:id', pgController.findOne);

// Protected routes (require authentication)
router.post('/', authMiddleware.verifyToken, pgController.create);
router.put('/:id', authMiddleware.verifyToken, pgController.update);
router.delete('/:id', authMiddleware.verifyToken, pgController.delete);

module.exports = router;
