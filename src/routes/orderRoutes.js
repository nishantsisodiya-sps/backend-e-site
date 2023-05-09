const express = require('express');
const router = express.Router();

const { createOrder, updateOrder , getOrders ,getSingleOrder } = require('../controller/orderController');

// Create a new order
router.post('/create-order', createOrder);

// Update an order
router.post('/update-order', updateOrder);

router.get('/:id' , getOrders);

router.get('/singleOrder/:id' , getSingleOrder)

module.exports = router;
