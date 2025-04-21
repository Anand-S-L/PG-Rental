const { v4: uuidv4 } = require('uuid');

// In-memory booking database
let bookings = [];

class Booking {
  constructor(bookingData) {
    this.id = bookingData.id || uuidv4();
    this.userId = bookingData.userId;
    this.pgId = bookingData.pgId;
    this.roomType = bookingData.roomType;
    this.checkInDate = bookingData.checkInDate;
    this.checkOutDate = bookingData.checkOutDate || null; // null for ongoing bookings
    this.status = bookingData.status || 'pending'; // pending, confirmed, cancelled, completed
    this.totalAmount = bookingData.totalAmount;
    this.paidAmount = bookingData.paidAmount || 0;
    this.paymentStatus = bookingData.paymentStatus || 'pending'; // pending, partial, completed
    this.createdAt = bookingData.createdAt || new Date();
    this.updatedAt = new Date();
  }

  // Find all bookings
  static findAll() {
    return [...bookings];
  }

  // Find by ID
  static findById(id) {
    return bookings.find(booking => booking.id === id);
  }

  // Find by user ID
  static findByUserId(userId) {
    return bookings.filter(booking => booking.userId === userId);
  }

  // Find by PG ID
  static findByPgId(pgId) {
    return bookings.filter(booking => booking.pgId === pgId);
  }

  // Create a new booking
  static create(bookingData) {
    const newBooking = new Booking(bookingData);
    bookings.push(newBooking);
    return newBooking;
  }

  // Update a booking
  static update(id, bookingData) {
    const index = bookings.findIndex(booking => booking.id === id);
    if (index === -1) return null;

    // Preserve the id and createdAt
    const updatedBooking = new Booking({
      ...bookingData,
      id,
      createdAt: bookings[index].createdAt
    });

    bookings[index] = updatedBooking;
    return updatedBooking;
  }

  // Delete a booking
  static delete(id) {
    const index = bookings.findIndex(booking => booking.id === id);
    if (index === -1) return false;

    bookings.splice(index, 1);
    return true;
  }

  // Calculate the balance amount
  calculateBalance() {
    return this.totalAmount - this.paidAmount;
  }

  // Update payment status based on paid amount
  updatePaymentStatus() {
    if (this.paidAmount === 0) {
      this.paymentStatus = 'pending';
    } else if (this.paidAmount < this.totalAmount) {
      this.paymentStatus = 'partial';
    } else {
      this.paymentStatus = 'completed';
    }
    return this.paymentStatus;
  }
}

module.exports = Booking;