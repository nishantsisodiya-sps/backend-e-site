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



exports.getAllOrder = async(req , res)=>{

  try {
    
    let orders = await Order.find()

    if(!orders){
      res.status(404).json({msg : 'Order not found'})
    }

    res.status(201).json({status : '201' , orders : orders})

  } catch (error) {
    console.log(error);
  }

}
