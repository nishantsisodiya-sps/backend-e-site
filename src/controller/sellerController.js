const Seller = require('../models/seller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new seller
exports.registerSeller = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: 'Seller already exists' });
    }

    // Hash password and create seller
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      phone,
      tokens: []
    });

    await newSeller.save();
    const token = jwt.sign({ id: newSeller._id  , email: newSeller.email , role : newSeller.role}, process.env.JWT_SECRET);
    console.log(token);
    newSeller.tokens.push({token}); // Add the token to the tokens array
    await newSeller.save();


    res.status(201).json({ token, success: true, message: "Logged in successfully", });
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
    const existingSeller = await Seller.findOne({ email });
    if (!existingSeller) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, existingSeller.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token and return it to the client
    const token = jwt.sign({ id: existingSeller._id }, process.env.JWT_SECRET);
    res.status(200).json({ token, success: true, message: "Logged in successfully", });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};



exports.getProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    return res.json({ seller });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server Error' });
  }
};
