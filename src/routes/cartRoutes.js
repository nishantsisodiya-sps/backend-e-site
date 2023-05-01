const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', 
cartController.addToCart);


router.get('/:userId',
cartController.getCart);
module.exports = router;