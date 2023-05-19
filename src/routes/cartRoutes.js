const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');

router.post('/add', 
cartController.addToCart);


router.get('/:userId',
cartController.getCart);

router.delete('/:cartItemId' ,
cartController.removeFromCart);


router.put('/:cartItemId', cartController.updateCartItem);

module.exports = router;