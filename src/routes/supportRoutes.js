const express = require('express')
const router = express.Router();
const supportController = require('../controller/supportController')
const superAdminCheck = require('../middleware/superAdminCheck')


router.post('/contactUs' , supportController.contactus);

router.post('/subscribe' , supportController.subscribe)
module.exports = router;