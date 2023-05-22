const express = require('express')
const router = express.Router()
const wishlistController = require('../controller/wishlistController')
const { authenticateUser } = require('../middleware/authMiddleware');


 
router.get('/:id' ,authenticateUser , wishlistController.GetWishList)

router.delete('/:id' , wishlistController.deleteProductFromWishlist)

router.post('/add',authenticateUser , wishlistController.AddProductToWishlist)


module.exports = router