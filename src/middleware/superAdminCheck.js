const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/superAdmin');

const superAdminCheck = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authorization token not provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the decoded token belongs to a super admin
    const superAdmin = await SuperAdmin.findOne({ _id: decoded?._id, 'tokens.token': token });

    if (!superAdmin) {
      return next();
    }

    // Add the super admin document to the request object
    req.superAdmin = superAdmin;

    // Allow access for super admin to all routes
    if (superAdmin) {
      return next();
    }

    // Proceed with authentication for other routes
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

module.exports = superAdminCheck;
