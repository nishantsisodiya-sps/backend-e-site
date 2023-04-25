const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const verifySeller = require('../middleware/authenticateSeller');

// Add a new product
router.post('/add', authMiddleware.authenticateSeller, verifySeller, uploadMiddleware.upload.single('image'), productController.addProduct);

// Get all products
router.get('/', verifySeller , productController.getProducts);

// Get seller products
router.get('/seller', verifySeller, authMiddleware.authenticateSeller, productController.getSellerProducts);

// Get a single product
router.get('/:id',verifySeller ,productController.getSingleProduct);

module.exports = router;
