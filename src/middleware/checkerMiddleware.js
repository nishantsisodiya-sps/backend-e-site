

const jwt = require('jsonwebtoken');
const Seller = require('../models/seller');
const User = require('../models/user');

const generateGuestToken = () => {
    const staticUserId = 'guest';
    // Static user ID for guest users
    const token = jwt.sign({ _id: staticUserId }, process.env.JWT_SECRET);
    console.log(token);
    return token;
  };

const checkToken = async (req, res, next) => {
  try {
    let token;
    if (req.header('Authorization')) {
      token = req.header('Authorization').replace('Bearer ', '');
    } else {
      // Generate guest token if Authorization header is not present
      token = generateGuestToken();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded._id === 'guest') {
      // Guest user, set guest ID in req.user
      req.user = { _id: 'guest' };
      req.token = token;
      return next();
    }

    // Check if the token belongs to a seller
    const seller = await Seller.findOne({ id: decoded._id, 'tokens.token': token });
    if (seller) {
      req.token = token;
      req.seller = seller;
      return next();
    }

    // Check if the token belongs to a user
    const user = await User.findOne({ id: decoded._id, 'tokens.token': token });
    if (user) {
      req.token = token;
      req.user = user;
      return next();
    }

    throw new Error();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = { checkToken };
