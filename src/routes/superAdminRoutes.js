const express = require('express')
const router = express.Router()
const superAdminController = require('../controller/superAdminController')
const superAdminCheck = require('../middleware/superAdminCheck')


router.post('/register'  , superAdminController.createSuperAdmin)

router.post('/login'  , superAdminController.loginSuperAdmin)

router.post('/blockUser/:id' , superAdminCheck.superAdminCheck , superAdminController.blockUser)

router.post('/blockSeller/:id', superAdminCheck.superAdminCheck , superAdminController.blockSeller)

router.get('/getAllOrder' , superAdminCheck.superAdminCheck , superAdminController.getAllOrder)

// router.get('/getRevenueByProduct'  , superAdminController.getTotalRevenueByProduct)

router.get('/getRevenue' , superAdminCheck.superAdminCheck , superAdminController.getRevenueAndOrderStats)


router.get('/blocked-users', superAdminCheck.superAdminCheck  , superAdminController.getBlockedUsers)


router.get('/blocked-sellers' , superAdminCheck.superAdminCheck  , superAdminController.getBlockedSellers)


module.exports = router