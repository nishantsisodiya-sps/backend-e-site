const verifySeller = (req, res, next) => {
    if (req.user && req.user.role === 'seller') {
      return next(); // User is authenticated as a seller, allow access to the route
    } else {
      return res.status(401).json({ message: 'Unauthorized access' }); // User is not authenticated as a seller, deny access to the route
    }
  };


 module.exports = verifySeller