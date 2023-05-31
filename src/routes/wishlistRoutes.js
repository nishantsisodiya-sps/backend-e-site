const express = require('express')
const router = express.Router()
const wishlistController = require('../controller/wishlistController')
const { authenticateUser } = require('../middleware/authMiddleware');
const checkLoggedIn = require('../middleware/checkerMiddleware')

// router.post('/add',authenticateUser , wishlistController.addProductToWishlist)
 
// router.get('/:id' ,authenticateUser , wishlistController.getWishlist)

// router.delete('/:id',authenticateUser  , wishlistController.deleteProductFromWishlist)

router.post('/add',checkLoggedIn.checkToken , wishlistController.AddProductToWishlist)
 
router.get('/:id' ,checkLoggedIn.checkToken , wishlistController.GetWishlist)

router.delete('/:id',checkLoggedIn.checkToken , wishlistController.deleteProductFromWishlist)



module.exports = router