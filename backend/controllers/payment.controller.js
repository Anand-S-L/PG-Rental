const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');

// Get all payments (admin only)
exports.getAllPayments = (req, res) => {
  try {
    const payments = Payment.findAll();
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get payment by ID
exports.getPaymentById = (req, res) => {
  try {
    const payment = Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get payments for a booking
exports.getBookingPayments = (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    
    // Check if booking exists
    const booking = Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check permission - only admin or booking owner can view payments
    if (req.user.role !== 'admin' && req.user.id !== booking.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these payments'
      });
    }
    
    const payments = Payment.findByBookingId(bookingId);
    
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get payments for a user
exports.getUserPayments = (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Check permission - only admin or the user can view their payments
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these payments'
      });
    }
    
    const payments = Payment.findByUserId(userId);
    
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a payment
exports.createPayment = (req, res) => {
  try {
    // Required fields validation
    const requiredFields = ['bookingId', 'amount', 'paymentMethod'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    
    // Check if booking exists
    const booking = Booking.findById(req.body.bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check permission - only admin or booking owner can make a payment
    if (req.user.role !== 'admin' && req.user.id !== booking.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to make a payment for this booking'
      });
    }
    
    // Set userId from authenticated user or from booking
    const paymentData = {
      ...req.body,
      userId: req.body.userId || booking.userId
    };
    
    // Create payment
    const newPayment = Payment.create(paymentData);
    
    // Update booking's paid amount
    booking.paidAmount += parseFloat(newPayment.amount);
    booking.paymentStatus = booking.updatePaymentStatus();
    Booking.update(booking.id, booking);
    
    res.status(201).json({
      success: true,
      data: newPayment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update a payment (admin only)
exports.updatePayment = (req, res) => {
  try {
    const payment = Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Only admin can update a payment
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can update payment records'
      });
    }
    
    // Calculate amount difference to update booking's paid amount
    const amountDifference = req.body.amount 
      ? parseFloat(req.body.amount) - parseFloat(payment.amount)
      : 0;
    
    const updatedPayment = Payment.update(req.params.id, req.body);
    
    // If amount changed, update booking's paid amount
    if (amountDifference !== 0) {
      const booking = Booking.findById(payment.bookingId);
      if (booking) {
        booking.paidAmount += amountDifference;
        booking.paymentStatus = booking.updatePaymentStatus();
        Booking.update(booking.id, booking);
      }
    }
    
    res.json({
      success: true,
      data: updatedPayment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Process a refund (admin only)
exports.processRefund = (req, res) => {
  try {
    const payment = Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Only admin can process refunds
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can process refunds'
      });
    }
    
    // Set payment status to refunded
    payment.status = 'refunded';
    const updatedPayment = Payment.update(payment.id, payment);
    
    // Update booking's paid amount
    const booking = Booking.findById(payment.bookingId);
    if (booking) {
      booking.paidAmount -= parseFloat(payment.amount);
      booking.paymentStatus = booking.updatePaymentStatus();
      Booking.update(booking.id, booking);
    }
    
    res.json({
      success: true,
      data: updatedPayment,
      message: 'Payment refunded successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};