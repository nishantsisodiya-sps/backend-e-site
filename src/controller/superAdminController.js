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

    // Hash password and create super admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newSuperAdmin = new SuperAdmin({
      username,
      email,
      password: hashedPassword
    });

    await newSuperAdmin.save();

    // Generate JWT token and return it to the client
    const token = jwt.sign({ id: newSuperAdmin._id }, process.env.JWT_SECRET);
    res.status(201).json({ token , });
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

    // Generate JWT token and return it to the client
    const token = jwt.sign({ id: existingSuperAdmin._id }, process.env.JWT_SECRET);
    res.status(200).json({ token , });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};
