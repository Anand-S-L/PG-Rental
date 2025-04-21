// Auth middleware with user roles
const User = require('../models/user.model');

// Decode token to get user ID
const decodeToken = (token) => {
  try {
    // In a real app, this would verify the JWT signature
    // For this demo, we're using a simple base64 encoding
    const decoded = Buffer.from(token, 'base64').toString().split(':');
    return { username: decoded[0], timestamp: decoded[1] };
  } catch (error) {
    return null;
  }
};

// Basic authentication middleware
exports.verifyToken = (req, res, next) => {
  // Get auth header
  const bearerHeader = req.headers['authorization'];

  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    
    if (bearerToken) {
      const decoded = decodeToken(bearerToken);
      
      if (decoded) {
        // Find user by username
        const user = User.findByUsername(decoded.username);
        
        if (user) {
          // Set the user and token in request object
          req.user = user;
          req.token = bearerToken;
          return next();
        }
      }
    }
  }
  
  // If no token, invalid token format, or user not found
  return res.status(401).json({
    success: false,
    message: 'Unauthorized access'
  });
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
};

// Check if the user is accessing their own data or is an admin
exports.isOwnerOrAdmin = (req, res, next) => {
  if (req.user) {
    // If user is admin or the resource belongs to the user
    if (req.user.role === 'admin' || req.user.id === req.params.userId) {
      return next();
    }
  }
  
  return res.status(403).json({
    success: false,
    message: 'Forbidden: You do not have permission to access this resource'
  });
};
