const User = require('../models/user.model');

// Get all users (admin only)
exports.getAllUsers = (req, res) => {
  try {
    const users = User.findAll();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user by ID
exports.getUserById = (req, res) => {
  try {
    const user = User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new user (register)
exports.createUser = (req, res) => {
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
    
    const newUser = User.create(req.body);
    
    // Generate token for auto login
    const token = Buffer.from(`${newUser.username}:${Date.now()}`).toString('base64');
    
    res.status(201).json({
      success: true,
      data: newUser,
      token
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update a user
exports.updateUser = (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // If password is provided, include it
    if (password) {
      updateData.password = password;
    }
    
    const updatedUser = User.update(req.params.id, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a user
exports.deleteUser = (req, res) => {
  try {
    const deleted = User.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user profile
exports.getProfile = (req, res) => {
  try {
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