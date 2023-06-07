const express = require('express');
const router = express.Router();
const sellerController = require('../controller/sellerController');
const authMiddleware = require('../middleware/authMiddleware');
const superAdminCheck = require('../middleware/superAdminCheck')

// Register a seller
router.post('/register', sellerController.registerSeller);

// Log in a seller
router.post('/login', sellerController.loginSeller);

// Get seller profile
router.get('/profile/:id',
superAdminCheck,
 authMiddleware.authenticateSeller, 
sellerController.getProfile);


router.get('/sold-products/:sellerId', superAdminCheck , sellerController.getSoldProducts);

module.exports = router;
