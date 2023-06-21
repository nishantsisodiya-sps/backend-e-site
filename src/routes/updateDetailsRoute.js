const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const update = require('../controller/updateDetails')


router.put('/user/:userId'  ,auth.checkLoggedIn ,  update.updateProfile)


router.put('/seller/:sellerId' ,auth.checkLoggedIn , update.updateProfile)


router.put('/changePassword/:userId?/:sellerId?', changePassword);

module.exports = router;