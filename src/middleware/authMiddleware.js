const jwt = require('jsonwebtoken');
const Seller = require('../models/seller');
const User = require('../models/user');
const superAdmin = require('../models/superAdmin');


const authenticateSeller = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const seller = await Seller.findOne({id: decoded._id, 'tokens.token': token });
    if (!seller) {
      throw new Error();
    }

    req.token = token;
    req.seller = seller;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate as a seller.' });
  }
};

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({id: decoded._id, 'tokens.token': token });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate as a user.' });
  }
};




const checkLoggedIn = async(req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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


    const superadmin = await superAdmin.findOne({ id: decoded._id, 'tokens.token': token});
    if(superAdmin){
      req.token = token;
      req.superAdmin = superadmin
      return next();
    }

    throw new Error();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};





module.exports = { authenticateSeller, authenticateUser , checkLoggedIn};
