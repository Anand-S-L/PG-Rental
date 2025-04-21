const { v4: uuidv4 } = require('uuid');

// In-memory payment database
let payments = [];

class Payment {
  constructor(paymentData) {
    this.id = paymentData.id || uuidv4();
    this.bookingId = paymentData.bookingId;
    this.userId = paymentData.userId;
    this.amount = paymentData.amount;
    this.paymentMethod = paymentData.paymentMethod || 'cash'; // cash, card, upi, etc.
    this.paymentDate = paymentData.paymentDate || new Date();
    this.status = paymentData.status || 'completed'; // pending, completed, failed, refunded
    this.transactionId = paymentData.transactionId;
    this.notes = paymentData.notes || '';
    this.createdAt = paymentData.createdAt || new Date();
    this.updatedAt = new Date();
  }

  // Find all payments
  static findAll() {
    return [...payments];
  }

  // Find by ID
  static findById(id) {
    return payments.find(payment => payment.id === id);
  }

  // Find by booking ID
  static findByBookingId(bookingId) {
    return payments.filter(payment => payment.bookingId === bookingId);
  }

  // Find by user ID
  static findByUserId(userId) {
    return payments.filter(payment => payment.userId === userId);
  }

  // Create a new payment
  static create(paymentData) {
    const newPayment = new Payment(paymentData);
    payments.push(newPayment);
    return newPayment;
  }

  // Update a payment
  static update(id, paymentData) {
    const index = payments.findIndex(payment => payment.id === id);
    if (index === -1) return null;

    // Preserve the id and createdAt
    const updatedPayment = new Payment({
      ...paymentData,
      id,
      createdAt: payments[index].createdAt
    });

    payments[index] = updatedPayment;
    return updatedPayment;
  }

  // Delete a payment
  static delete(id) {
    const index = payments.findIndex(payment => payment.id === id);
    if (index === -1) return false;

    payments.splice(index, 1);
    return true;
  }

  // Get total payments for a booking
  static getTotalForBooking(bookingId) {
    const bookingPayments = this.findByBookingId(bookingId);
    return bookingPayments.reduce((total, payment) => 
      payment.status === 'completed' ? total + payment.amount : total, 0);
  }
}

module.exports = Payment;