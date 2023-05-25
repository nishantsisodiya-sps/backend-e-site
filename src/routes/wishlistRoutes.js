const express = require('express')
const router = express.Router()
const wishlistController = require('../controller/wishlistController')
const { authenticateUser } = require('../middleware/authMiddleware');


// router.post('/add',authenticateUser , wishlistController.addProductToWishlist)
 
// router.get('/:id' ,authenticateUser , wishlistController.getWishlist)

// router.delete('/:id',authenticateUser  , wishlistController.deleteProductFromWishlist)

router.post('/add',authenticateUser , wishlistController.AddProductToWishlist)
 
router.get('/:id' ,authenticateUser , wishlistController.GetWishList)

router.delete('/:id',authenticateUser  , wishlistController.deleteProductFromWishlist)



module.exports = router