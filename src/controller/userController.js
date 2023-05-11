const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      phone,
      tokens: []
    });

    // Hash the password before saving
    await newUser.save();

    // Generate authentication token for the user
    const authToken = await newUser.generateAuthToken();

    // Send response with authentication token
    return res.status(201).json({ message: 'User registered successfully', token: authToken });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}


//Login User
exports.loginUser = async (req, res) => {

  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password with hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate authentication token for the user
    const authToken = await user.generateAuthToken();

    // Send response with authentication token
    return res.status(200).json({ message: 'Login successful', token: authToken , success : true });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }

}




exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.params.id
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};