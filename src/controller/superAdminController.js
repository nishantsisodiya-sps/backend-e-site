const SuperAdmin = require('../models/superAdmin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new super admin
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if super admin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super admin already exists' });
    }

    // Create a new super admin

    const newSuperAdmin = new SuperAdmin({
      username,
      email,
      password,
      token : []
    });

    await newSuperAdmin.save();

    const authToken = await newSuperAdmin.generateAuthToken()

    res.status(201).json({ token : authToken , success : true , message : "Sign in as Super Admin" });
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
