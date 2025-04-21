const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// In-memory user database
let users = [
  {
    id: 'user1',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed_password_123', // In a real app, use proper password hashing
    fullName: 'Test User',
    phone: '9876543210',
    role: 'customer',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

class User {
  constructor(userData) {
    this.id = userData.id || uuidv4();
    this.username = userData.username;
    this.email = userData.email;
    this.passwordHash = userData.passwordHash || this.hashPassword(userData.password);
    this.fullName = userData.fullName;
    this.phone = userData.phone;
    this.role = userData.role || 'customer'; // 'customer' or 'admin'
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = new Date();
  }

  // Hash password using a simple hashing method
  // In a real app, use bcrypt with proper salt
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // Verify password
  verifyPassword(password) {
    return this.passwordHash === this.hashPassword(password);
  }

  // For security, exclude password when converting to JSON
  toJSON() {
    const { passwordHash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Find all users
  static findAll() {
    return users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  // Find user by ID
  static findById(id) {
    const user = users.find(user => user.id === id);
    if (!user) return null;
    
    // Return a new instance to use instance methods
    return new User(user);
  }

  // Find user by username
  static findByUsername(username) {
    const user = users.find(user => user.username === username);
    if (!user) return null;
    
    return new User(user);
  }

  // Find user by email
  static findByEmail(email) {
    const user = users.find(user => user.email === email);
    if (!user) return null;
    
    return new User(user);
  }

  // Create a new user
  static create(userData) {
    // Check if username or email already exists
    if (users.some(user => user.username === userData.username)) {
      throw new Error('Username already exists');
    }
    if (users.some(user => user.email === userData.email)) {
      throw new Error('Email already exists');
    }

    const newUser = new User(userData);
    users.push(newUser);
    return newUser;
  }

  // Update an existing user
  static update(id, userData) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;

    // Preserve the id, passwordHash and createdAt
    const existingUser = users[index];
    const updatedUser = new User({
      ...userData,
      id,
      passwordHash: userData.password ? undefined : existingUser.passwordHash,
      createdAt: existingUser.createdAt
    });

    users[index] = updatedUser;
    return updatedUser;
  }

  // Delete a user
  static delete(id) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    return true;
  }
}

module.exports = User;