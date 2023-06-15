const express = require('express')
const router = express.Router()
const superAdminController = require('../controller/superAdminController')
const superAdminCheck = require('../middleware/superAdminCheck')


router.post('/register'  , superAdminController.createSuperAdmin)

router.post('/login'  , superAdminController.loginSuperAdmin)

router.post('/blockUser/:id' , superAdminCheck , superAdminController.blockUser)

router.post('/blockSeller/:id', superAdminCheck , superAdminController.blockSeller)


module.exports = router