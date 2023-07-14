const express = require('express');
const router = express.Router();

const { createOrder, updateOrder , getOrders ,getSingleOrder , deleteAllOrders , cancelOrder} = require('../controller/orderController');
const auth = require('../middleware/authMiddleware')
const superAdminCheck = require('../middleware/superAdminCheck')

// Create a new order
router.post('/create-order' ,auth.checkLoggedIn, createOrder);

router.post('/singleOrder' ,  auth.checkLoggedIn, getSingleOrder)

// Update an order
router.post('/update-order', auth.checkLoggedIn , updateOrder);


router.put('/cancel' ,auth.checkLoggedIn, cancelOrder)

router.get('/:id' , auth.checkLoggedIn ,  getOrders);

router.delete('/deleteAll/:id' ,auth.checkLoggedIn, deleteAllOrders)


module.exports = router;
