const express = require('express');
const router = express.Router();
const sellerController = require('../controller/sellerController');
const authMiddleware = require('../middleware/authMiddleware');

// Register a seller
router.post('/register', sellerController.registerSeller);

// Log in a seller
router.post('/login', sellerController.loginSeller);

// Get seller profile
router.get('/profile/:id', authMiddleware.authenticateSeller, sellerController.getProfile);

module.exports = router;
