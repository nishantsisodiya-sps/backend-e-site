const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const addressController = require('../controller/addressController')
const superAdminCheck = require('../middleware/superAdminCheck')

router.get('/get',[superAdminCheck.superAdminCheck, auth.checkLoggedIn], addressController.getAllAddresses);

router.post('/add', [superAdminCheck.superAdminCheck, auth.checkLoggedIn], addressController.createAddress);

// Get Address by ID
router.get('/:id', [superAdminCheck.superAdminCheck, auth.checkLoggedIn], addressController.getAddressById);


// Update Address by ID
router.put('/:id', [superAdminCheck.superAdminCheck, auth.checkLoggedIn], addressController.updateAddressById);

// Delete Address by ID
router.delete('/:id', [superAdminCheck.superAdminCheck, auth.checkLoggedIn], addressController.deleteAddressById);

// Set default address
router.put('/address/set-default/:id', addressController.setDefaultAddress);


module.exports = router