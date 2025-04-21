// Simple authentication middleware
exports.verifyToken = (req, res, next) => {
  // Get auth header
  const bearerHeader = req.headers['authorization'];

  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    
    // For this simple implementation, we just check if the token exists
    // In a real app, we'd verify the JWT token here
    if (bearerToken) {
      // Set the token
      req.token = bearerToken;
      // Next middleware
      return next();
    }
  }
  
  // If no token or invalid token format
  return res.status(403).json({
    success: false,
    message: 'Unauthorized access'
  });
};
