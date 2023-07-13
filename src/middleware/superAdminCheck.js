const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/superAdmin');

const superAdminCheck = async (req, res, next) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ message: 'Authorization token not provided' });
    }

    // Remove 'Bearer ' prefix from the token
    const tokenWithoutBearer = token.replace('Bearer ', '');

    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

    // Check if the decoded token belongs to a super admin
    const superAdmin = await SuperAdmin.findOne({ id: decoded?._id, 'tokens.token': tokenWithoutBearer });


    // Add the super admin document to the request object
    req.superAdmin = superAdmin;

    if (superAdmin) {
      return next();
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

module.exports = superAdminCheck;
