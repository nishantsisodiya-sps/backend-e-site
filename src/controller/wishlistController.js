const Wishlist = require('../models/wishlist');
const Products = require('../models/products');



exports.AddProductToWishlist = async (req, res) => {
    console.log('hello');
    try {
        const userId = req.user._id;
        const productId = req.body.productId;
    
        // Check if the product already exists in the wishlist
        const wishlist = await Wishlist.findOne({ user: userId });
        if (wishlist.product.includes(productId)) {
          return res.status(400).json({ message: 'Product already exists in the wishlist' });
        }
    
        // Add the product to the wishlist
        wishlist.products.push(productId);
        await wishlist.save();
    
        res.status(200).json({
          message: 'Product added to wishlist',
          wishlist: wishlist
        });
      } catch (error) {
        console.log('Add to Wishlist', error);
        res.status(500).json({
          error: error
        });
      }
};





exports.GetWishList = async (req, res) => {
    try {
        const userId = req.user._id;
    
        // Fetch the wishlist with populated product details
        const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
    
        if (wishlist) {
          res.status(200).json({
            message: 'Wishlist Found',
            wishlist: wishlist
          });
        } else {
          res.status(404).json({
            message: 'Wishlist Not Found'
          });
        }
      } catch (error) {
        console.log('Get Wishlist', error);
        res.status(500).json({
          error: error
        });
      }
  };