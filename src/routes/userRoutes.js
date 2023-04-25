const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Register a user
router.post('/register', userController.registerUser);

// Log in a user
router.post('/login', userController.loginUser);

// Get user profile
router.get('/profile', authMiddleware.authenticateUser, userController.getProfile);

module.exports = router;
