const express = require('express')
const router = express.Router()
const supportController = require('../controller/supportController')


router.post('/support' , supportController.contactus);


module.exports = router;