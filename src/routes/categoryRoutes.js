const express = require('express');
const router = express.Router();
const productCategories = require('../controller/categoryController');
const superAdminCheck = require('../middleware/superAdminCheck')

// Retrieve all Product Categories
router.get('/' , productCategories.findAll);


router.get('/:productCategoryId' , productCategories.getProductsByCategory);

// Create a new Product Category
router.post('/productCategories',superAdminCheck , productCategories.create);
  
  
// Retrieve a single Product Category with productCategoryId
router.get('/productCategories/:productCategoryId' , productCategories.findOne);

  
// Update a Product Category with productCategoryId
router.put('/productCategories/:productCategoryId', superAdminCheck , productCategories.update);

  
// Delete a Product Category with productCategoryId
router.delete('/productCategories/:productCategoryId',superAdminCheck , productCategories.delete);




module.exports = router