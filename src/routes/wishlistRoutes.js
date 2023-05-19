const express = require('express')
const router = express.Router()
const wishlistController = require('../controller/wishlistController')


router.post('/add/:id' , wishlistController.AddProductToWishlist)

router.get('/:id' , wishlistController.GetWishList)

module.exports = router