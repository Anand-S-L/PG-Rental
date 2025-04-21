const express = require('express');
const router = express.Router();
const upiController = require('../controllers/upi.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware.verifyToken);

// UPI payment routes
router.post('/initiate', upiController.initiateUpiPayment);
router.post('/verify', upiController.verifyUpiPayment);
router.get('/status/:bookingId', upiController.getPaymentStatus);

module.exports = router;