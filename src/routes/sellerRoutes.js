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
 authMiddleware.authenticateSeller, 
sellerController.getProfile);


router.get('/sold-products/:sellerId' , sellerController.getSoldProducts);


// router.get('/sold-productsNew/:sellerId' , sellerController.getSoldProductsSeller);


router.get('/AllSellers' , sellerController.getSellers);

module.exports = router;
