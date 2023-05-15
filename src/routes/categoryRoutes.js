const express = require('express');
const router = express.Router();
const productCategories = require('../controller/categoryController');


// Retrieve all Product Categories
router.get('/', productCategories.findAll);

router.get('/:productCategoryId', productCategories.getProductsByCategory);

// Create a new Product Category
router.post('/productCategories', productCategories.create);
  
  
    // Retrieve a single Product Category with productCategoryId
router.get('/productCategories/:productCategoryId', productCategories.findOne);
  
    // Update a Product Category with productCategoryId
router.put('/productCategories/:productCategoryId', productCategories.update);
  
    // Delete a Product Category with productCategoryId
router.delete('/productCategories/:productCategoryId', productCategories.delete);




module.exports = router