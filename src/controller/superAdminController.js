const SuperAdmin = require('../models/superAdmin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user')
const Seller = require('../models/seller');
const Order = require('../models/order');


// Register a new super admin
exports.createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if super admin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super admin already exists' });
    }

    // Generate an ID for the super admin
    const superAdminId = uuidv4();

    // Create a new super admin
    const newSuperAdmin = new SuperAdmin({
      _id: superAdminId,
      name,
      email,
      password,
    });

    await newSuperAdmin.save();

    const authToken = await newSuperAdmin.generateAuthToken();


    res.status(201).json({ token: authToken, success: true, message: 'Super admin created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

// Login a super admin
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if super admin exists
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (!existingSuperAdmin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, existingSuperAdmin.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate auth token
    const authToken = await existingSuperAdmin.generateAuthToken()
    res.status(200).json({ token: authToken, success: true, message: "Sign in as Super Admin" });

  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};



exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle the block status
    user.isBlocked = !user.isBlocked;
    await user.save();

    const message = user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully';
    res.json({ msg: message });
  } catch (error) {
    console.log('Toggle block user error', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
};



exports.blockSeller = async(req , res)=>{
  try {
    const sellerId = req.params.id;
   

    const seller = await Seller.findById(sellerId);
 
    if(!seller){
      res.status(404).json({message : "seller not found"})
    }

    // Toggle the block status
    seller.isBlocked = !seller.isBlocked;
    await seller.save()

    const message = seller.isBlocked ? 'Seller blocked successfully' : 'Seller unblocked successfully';
    res.json({msg : message})


  } catch (error) {
    console.log('Block selller error', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
}




exports.getAllOrder = async (req, res) => {
  try {
    let orders = await Order.find().populate('products.product');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    let ordersWithProducts = [];

    for (const order of orders) {
      for (const product of order.products) {
        let orderWithProduct = {
          orderDetails: {
            _id: order._id,
            userId: order.userId,
            name: order.name,
            address: order.address,
            amount: order.amount,
            PaymentStatus: order.PaymentStatus,
            paymentId: order.paymentId,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          },
          productDetails: {
            product: product.product,
            seller: product.seller,
            quantity: product.quantity,
            status: product.status,
            shippingDetails: product.shippingDetails,
          },
        };

        ordersWithProducts.push(orderWithProduct);
      }
    }

    res.status(200).json({ status: 200, orders: ordersWithProducts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};



exports.getRevenueAndOrderStats = async (req, res) => {
  try {
    // Get total revenue earned
    const orders = await Order.find();
    const totalRevenue = orders.reduce((acc, order) => acc + parseFloat(order.amount), 0);

    // Get total order count
    const totalOrderCount = orders.length;

    // Get top 5 products by purchase count
    const productStats = await Order.aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          count: { $sum: '$products.quantity' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          count: 1,
          name: '$productDetails.title',
          price: '$productDetails.price',
          thumbnail: '$productDetails.thumbnail',
        },
      },
    ]);

    res.status(200).json({
      totalRevenue,
      totalOrderCount,
      topProducts: productStats,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};




exports.getBlockedUsers = async (req, res) => {
  try {
    const blockedUsers = await User.find({ isBlocked: true });
    res.status(200).json(blockedUsers);
  } catch (error) {
    console.log('getBlockedUsers error:', error);
    res.status(500).json({ msg: 'Error occurred' });
  }
};



exports.getBlockedSellers = async (req, res) => {
  try {
    const blockedSellers = await Seller.find({ isBlocked: true });
    res.status(200).json(blockedSellers);
  } catch (error) {
    console.log('blockedSellers error:', error);
    res.status(500).json({ msg: 'Error occurred' });
  }
};



