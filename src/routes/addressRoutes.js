const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const addressController = require('../controller/addressController')


router.get('/get', auth.checkLoggedIn, addressController.getAllAddresses);

router.post('/add', auth.checkLoggedIn, addressController.createAddress);

// Get Address by ID
router.get('/:id', auth.checkLoggedIn, addressController.getAddressById);


// Update Address by ID
router.put('/:id', auth.checkLoggedIn, addressController.updateAddressById);

// Delete Address by ID
router.delete('/:id', auth.checkLoggedIn, addressController.deleteAddressById);

// Create Address

//Get single address


module.exports = router