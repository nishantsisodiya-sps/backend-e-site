const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const authMiddleware = require('../middleware/authMiddleware')


router.get('/:userId',
    cartController.getCart);

router.delete('/:cartItemId', authMiddleware.checkLoggedIn,
    cartController.removeFromCart);


router.put('/:cartItemId', authMiddleware.checkLoggedIn, cartController.updateCartItem);

router.post('/add', authMiddleware.checkLoggedIn,
    cartController.addToCart);


router.delete('/all/:userId',
    cartController.deleteAllProductsFromCart);



module.exports = router;