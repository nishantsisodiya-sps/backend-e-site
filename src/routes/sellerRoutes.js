const express = require('express');
const router = express.Router();
const sellerController = require('../controller/sellerController');
const authMiddleware = require('../middleware/authMiddleware');

// Register a seller
router.post('/register', sellerController.register);

// Log in a seller
router.post('/login', sellerController.login);

// Get seller profile
router.get('/profile', authMiddleware.authenticateSeller, sellerController.getProfile);

module.exports = router;
