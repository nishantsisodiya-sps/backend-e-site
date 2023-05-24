const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const addressController = require('../controller/addressController')


// Create Address
router.post('/add', auth.checkLoggedIn, addressController.createAddress);

// Get Address by ID
router.get('/:id', auth.checkLoggedIn, addressController.getAddressById);


// Update Address by ID
router.put('/:id', auth.checkLoggedIn, addressController.updateAddressById);

// Delete Address by ID
router.delete('/:id', auth.checkLoggedIn, addressController.deleteAddressById);


//Get single address
router.get('/get/:id', auth.checkLoggedIn, addressController.getAllAddresses);


module.exports = router