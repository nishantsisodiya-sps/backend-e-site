const SuperAdmin = require('../models/superAdmin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user')
const Seller = require('../models/seller')

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
   res.status(200).json({ token : authToken , success : true , message : "Sign in as Super Admin" });

  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};



exports.blockUser = async (req, res) => {
  try {
    const { userType, userId } = req.params;

    let user;

    // Find the user by ID based on the user type
    if (userType === 'user') {
      user = await User.findById(userId);
    } else if (userType === 'seller') {
      // Replace 'Seller' with your seller model name if different
      user = await Seller.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update the user's block status
    user.isBlocked = true;
    await user.save();

    res.json({ msg: 'User blocked successfully' });
  } catch (error) {
    console.log('Block user error', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
};



