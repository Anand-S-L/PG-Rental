const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Routes requiring admin access
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, bookingController.getAllBookings);

// Routes requiring authentication
router.post('/', authMiddleware.verifyToken, bookingController.createBooking);
router.get('/user/:userId', authMiddleware.verifyToken, authMiddleware.isOwnerOrAdmin, bookingController.getUserBookings);
router.get('/me', authMiddleware.verifyToken, (req, res) => {
  req.params.userId = req.user.id;
  bookingController.getUserBookings(req, res);
});

// Routes requiring authentication and ownership/admin
router.get('/:id', authMiddleware.verifyToken, bookingController.getBookingById);
router.put('/:id', authMiddleware.verifyToken, bookingController.updateBooking);
router.post('/:id/cancel', authMiddleware.verifyToken, bookingController.cancelBooking);

module.exports = router;