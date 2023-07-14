const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const superAdminCheck = require('../middleware/superAdminCheck')

// Register a user
router.post('/register', userController.registerUser);

// Log in a user
router.post('/login', userController.loginUser);

// Get user profile
router.get('/profile/:id', 

superAdminCheck.authenticateUserOrSuperAdmin,
 userController.getProfile);


 router.get('/Allusers' , userController.getUsers)

module.exports = router;
