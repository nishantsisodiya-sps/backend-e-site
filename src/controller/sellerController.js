const Seller = require('../models/seller');
const bcrypt = require('bcryptjs');
const Order = require('../models/order');
const mongoose = require('mongoose')

// Register a new seller
exports.registerSeller = async (req, res) => {
  try {
     const { name, email, password, phone } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(409).json({ message: 'Seller already exists' });
    }

    //Creating seller
    const newSeller = new Seller({
      name,
      email,
      password,
      phone,
      tokens: []
    });

    await newSeller.save();

    const authToken = await newSeller.generateAuthToken();


    res.status(201).json({ token : authToken, success: true, message: "Sign in successfully", });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};


// Login a seller
exports.loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
  

    // Check if seller exists
    const existingSeller = await Seller.findOne({ email : email });
    if (!existingSeller) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, existingSeller.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    
    const authToken = await existingSeller.generateAuthToken();
      res.status(200).json({ token:authToken, success: true, message: "Logged in successfully", });
  

  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};



exports.getProfile = async (req, res) => {
  try {
    const sellerId = req.params.id
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    return res.json({ seller });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server Error' });
  }
};






exports.getSoldProducts = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    // Retrieve sold products information for the seller
    const soldProducts = await Order.aggregate([
      {
        $match: {
          'products.seller': new mongoose.Types.ObjectId(sellerId),
          status: { $in: ['PAID', 'shipped', 'delivered'] }
        }
      },
      {
        $unwind: '$products'
      },
      {
        $match: {
          'products.seller': new mongoose.Types.ObjectId(sellerId)
        }
      },
      {
        $group: {
          _id: '$products.product',
          quantitySold: { $sum: '$products.quantity' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $match: {
          'product.seller': new mongoose.Types.ObjectId(sellerId)
        }
      }
    ]);

    res.json( soldProducts);
  } catch (error) {
    console.error('Get sold products error:', error);
    res.status(500).json({ error: 'Unable to fetch sold products' });
  }
};




