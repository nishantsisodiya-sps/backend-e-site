const express = require('express');
const productController = require('../controller/productController');
const authMiddleware = require('../middleware/authMiddleware');
const verifySeller = require('../middleware/verifySeller');
const uploadMiddleware = require('../middleware/uploadMiddleware');

const router = express.Router();

// Get all products
router.get('/', productController.getProducts);

// Get single product by ID
router.get('/:id', productController.getSingleProduct);

// Add a new product
router.post('/add', 
  authMiddleware.authenticateSeller, 
  verifySeller, 
uploadMiddleware.upload,
  productController.addProduct
);


// Get all products of a seller
router.get('/seller/:sellerId', 
authMiddleware.authenticateSeller,
 productController.getSellerProducts);

module.exports = router;
