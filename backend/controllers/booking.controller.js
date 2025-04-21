const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');
const PG = require('../models/pg.model');

// Get all bookings (admin only)
exports.getAllBookings = (req, res) => {
  try {
    const bookings = Booking.findAll();
    
    // Enhance bookings with PG details
    const enhancedBookings = bookings.map(booking => {
      const pg = PG.findById(booking.pgId);
      return {
        ...booking,
        pg: pg ? {
          id: pg.id,
          title: pg.title,
          location: pg.location,
          image: pg.images && pg.images.length > 0 ? pg.images[0] : null
        } : null
      };
    });
    
    res.json({
      success: true,
      data: enhancedBookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get booking by ID
exports.getBookingById = (req, res) => {
  try {
    const booking = Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Get PG details
    const pg = PG.findById(booking.pgId);
    
    // Get payment history
    const payments = Payment.findByBookingId(booking.id);
    
    res.json({
      success: true,
      data: {
        ...booking,
        pg: pg ? {
          id: pg.id,
          title: pg.title,
          location: pg.location,
          roomTypes: pg.roomTypes,
          amenities: pg.amenities,
          images: pg.images
        } : null,
        payments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get bookings for a user
exports.getUserBookings = (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const bookings = Booking.findByUserId(userId);
    
    // Enhance bookings with PG details
    const enhancedBookings = bookings.map(booking => {
      const pg = PG.findById(booking.pgId);
      return {
        ...booking,
        pg: pg ? {
          id: pg.id,
          title: pg.title,
          location: pg.location,
          image: pg.images && pg.images.length > 0 ? pg.images[0] : null
        } : null
      };
    });
    
    res.json({
      success: true,
      data: enhancedBookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a booking
exports.createBooking = (req, res) => {
  try {
    // Required fields validation
    const requiredFields = ['pgId', 'roomType', 'checkInDate', 'totalAmount'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    
    // Set userId from authenticated user
    const bookingData = {
      ...req.body,
      userId: req.user.id
    };
    
    // Verify PG exists
    const pg = PG.findById(bookingData.pgId);
    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found'
      });
    }
    
    // Verify room type is available
    const roomType = pg.roomTypes.find(r => 
      r.type === bookingData.roomType && r.available);
    
    if (!roomType) {
      return res.status(400).json({
        success: false,
        message: `Room type ${bookingData.roomType} not available`
      });
    }
    
    // Create booking
    const newBooking = Booking.create(bookingData);
    
    // If initial payment is provided, create a payment record
    if (req.body.initialPayment && req.body.initialPayment > 0) {
      const paymentData = {
        bookingId: newBooking.id,
        userId: req.user.id,
        amount: req.body.initialPayment,
        paymentMethod: req.body.paymentMethod || 'cash',
        status: 'completed',
        notes: 'Initial payment at time of booking'
      };
      
      const payment = Payment.create(paymentData);
      
      // Update booking's paid amount
      newBooking.paidAmount = payment.amount;
      newBooking.paymentStatus = newBooking.updatePaymentStatus();
      Booking.update(newBooking.id, newBooking);
    }
    
    res.status(201).json({
      success: true,
      data: newBooking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update a booking
exports.updateBooking = (req, res) => {
  try {
    const booking = Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check permission - only admin or booking owner can update
    if (req.user.role !== 'admin' && req.user.id !== booking.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this booking'
      });
    }
    
    const updatedBooking = Booking.update(req.params.id, req.body);
    
    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel a booking
exports.cancelBooking = (req, res) => {
  try {
    const booking = Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check permission - only admin or booking owner can cancel
    if (req.user.role !== 'admin' && req.user.id !== booking.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this booking'
      });
    }
    
    // Update booking status to cancelled
    booking.status = 'cancelled';
    const updatedBooking = Booking.update(booking.id, booking);
    
    res.json({
      success: true,
      data: updatedBooking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};