const User = require('../models/user.model');

// Login handler
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Find user by username
    const user = User.findByUsername(username);
    
    // Check if user exists and verify password
    if (!user || !user.verifyPassword(password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Generate token
    const token = Buffer.from(`${user.username}:${Date.now()}`).toString('base64');
    
    // Return user data and token
    res.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Register handler
exports.register = (req, res) => {
  try {
    // Required fields validation
    const requiredFields = ['username', 'email', 'password', 'fullName'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    
    // Check if username or email already exists
    if (User.findByUsername(req.body.username)) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    if (User.findByEmail(req.body.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Create new user
    const newUser = User.create(req.body);
    
    // Generate token for auto login
    const token = Buffer.from(`${newUser.username}:${Date.now()}`).toString('base64');
    
    // Return user data and token
    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user
exports.getCurrentUser = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Change password
exports.changePassword = (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Verify current password
    if (!req.user.verifyPassword(currentPassword)) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    const updatedUser = User.update(req.user.id, {
      password: newPassword
    });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};