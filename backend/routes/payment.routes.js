const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Routes requiring admin access
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, paymentController.getAllPayments);

// Routes requiring authentication
router.post('/', authMiddleware.verifyToken, paymentController.createPayment);
router.get('/booking/:bookingId', authMiddleware.verifyToken, paymentController.getBookingPayments);
router.get('/user/:userId', authMiddleware.verifyToken, authMiddleware.isOwnerOrAdmin, paymentController.getUserPayments);
router.get('/me', authMiddleware.verifyToken, (req, res) => {
  req.params.userId = req.user.id;
  paymentController.getUserPayments(req, res);
});

// Routes requiring admin access
router.get('/:id', authMiddleware.verifyToken, paymentController.getPaymentById);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, paymentController.updatePayment);
router.post('/:id/refund', authMiddleware.verifyToken, authMiddleware.isAdmin, paymentController.processRefund);

module.exports = router;