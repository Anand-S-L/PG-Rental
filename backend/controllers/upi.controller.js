const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');

// Initiate a UPI payment
exports.initiateUpiPayment = (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    
    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and amount are required'
      });
    }
    
    // Verify booking exists
    const booking = Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check permission - only booking owner can make a payment
    if (req.user.id !== booking.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to make a payment for this booking'
      });
    }
    
    // Generate a unique payment ID
    const paymentId = `UPI_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // UPI details - this would normally be fetched from a database
    const upiDetails = {
      upiId: 'anandsl147@gmail.com',
      name: 'PG Rental Services',
      paymentId: paymentId
    };
    
    res.status(200).json({
      success: true,
      data: {
        bookingId,
        amount,
        paymentId,
        upiDetails
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify a UPI payment (in a real app, this would integrate with a UPI service)
exports.verifyUpiPayment = (req, res) => {
  try {
    const { bookingId, paymentId, transactionId, amount } = req.body;
    
    if (!bookingId || !paymentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, payment ID, and amount are required'
      });
    }
    
    // Verify booking exists
    const booking = Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // In a real app, you would verify the transaction with a UPI service
    // For this demo, we'll just create a payment record
    
    const paymentData = {
      bookingId,
      userId: req.user.id,
      amount: parseFloat(amount),
      paymentMethod: 'upi',
      transactionId: transactionId || paymentId,
      status: 'completed',
      notes: 'UPI payment'
    };
    
    // Create payment record
    const payment = Payment.create(paymentData);
    
    // Update booking's paid amount
    booking.paidAmount += parseFloat(payment.amount);
    booking.paymentStatus = booking.updatePaymentStatus();
    Booking.update(booking.id, booking);
    
    res.status(200).json({
      success: true,
      data: {
        payment,
        booking
      },
      message: 'Payment verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check payment status for a booking
exports.getPaymentStatus = (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Verify booking exists
    const booking = Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check permission - only booking owner can check status
    if (req.user.id !== booking.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this booking'
      });
    }
    
    // Get payments for the booking
    const payments = Payment.findByBookingId(bookingId);
    
    res.status(200).json({
      success: true,
      data: {
        booking,
        payments,
        totalPaid: booking.paidAmount,
        totalAmount: booking.totalAmount,
        balance: booking.totalAmount - booking.paidAmount,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};