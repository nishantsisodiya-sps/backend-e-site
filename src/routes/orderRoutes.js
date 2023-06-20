const express = require('express');
const router = express.Router();

const { createOrder, updateOrder , getOrders ,getSingleOrder , deleteAllOrders } = require('../controller/orderController');
const auth = require('../middleware/authMiddleware')
const superAdminCheck = require('../middleware/superAdminCheck')

// Create a new order
router.post('/create-order' ,auth.checkLoggedIn, createOrder);

// Update an order
router.post('/update-order', auth.checkLoggedIn , updateOrder);

router.post('/singleOrder' ,  auth.checkLoggedIn, getSingleOrder)


router.get('/:id' , auth.checkLoggedIn ,  getOrders);

router.delete('/deleteAll/:id' ,auth.checkLoggedIn, deleteAllOrders)

module.exports = router;
