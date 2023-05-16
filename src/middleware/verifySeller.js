const jwt = require('jsonwebtoken');

const verifySeller = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'seller') {
      req.user = decoded;
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
};

module.exports = verifySeller;