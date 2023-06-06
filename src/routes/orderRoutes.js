const express = require('express');
const router = express.Router();

const { createOrder, updateOrder , getOrders ,getSingleOrder , deleteAllOrders } = require('../controller/orderController');
const auth = require('../middleware/authMiddleware')

// Create a new order
router.post('/create-order' ,auth.checkLoggedIn, createOrder);

// Update an order
router.post('/update-order',auth.checkLoggedIn , updateOrder);

router.get('/:id' ,auth.checkLoggedIn ,  getOrders);

router.get('/singleOrder/:id' ,auth.checkLoggedIn, getSingleOrder)


router.delete('/deleteAll/:id' ,auth.checkLoggedIn, deleteAllOrders)

module.exports = router;
