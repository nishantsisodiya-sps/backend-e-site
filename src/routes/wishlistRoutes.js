const express = require('express')
const router = express.Router()
const wishlistController = require('../controller/wishlistController')
const checkLoggedIn = require('../middleware/checkerMiddleware')
const superAdminCheck = require('../middleware/superAdminCheck')



router.post('/add', superAdminCheck,checkLoggedIn.checkToken , wishlistController.AddProductToWishlist)
 
router.get('/:id' , superAdminCheck,checkLoggedIn.checkToken  , wishlistController.GetWishlist)

router.delete('/:id' ,superAdminCheck,checkLoggedIn.checkToken  , wishlistController.deleteProductFromWishlist)



module.exports = router