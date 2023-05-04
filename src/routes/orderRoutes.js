const express = require('express');
const router = express.Router();

const { createOrder, updateOrder } = require('../controller/orderController');

// Create a new order
router.post('/create-order', createOrder);

// Update an order
router.post('/update-order', updateOrder);

module.exports = router;
