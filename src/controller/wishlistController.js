const Wishlist = require('../models/wishlist');
const Product = require('../models/products')



exports.AddProductToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.body.productId;

    const wishlist = await Wishlist.findOne({ userId: userId });

    if (!wishlist) {
      // Wishlist doesn't exist for the user, create a new one
      const newWishlist = new Wishlist({
        userId: userId,
        products: [productId]
      });
      await newWishlist.save();

      res.status(200).json({
        message: 'Product added to wishlist',
        wishlist: newWishlist
      });
    } else {
      const productExists = wishlist.products.includes(productId);

      if (productExists) {
        // Product already exists in the wishlist, remove it
        await Wishlist.updateOne({ userId: userId }, { $pull: { products: productId } });

        res.status(200).json({
          message: 'Product removed from wishlist',
          wishlist: wishlist
        });
      } else {
        // Product doesn't exist in the wishlist, add it
        await Wishlist.updateOne({ userId: userId }, { $push: { products: productId } });

        wishlist.products.push(productId);

        res.status(200).json({
          message: 'Product added to wishlist',
          wishlist: wishlist
        });
      }
    }
  } catch (error) {
    console.log('Add to Wishlist', error);
    res.status(500).json({
      error: error
    });
  }
};






exports.GetWishlist = async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch the wishlist with fully populated product details
    const wishlist = await Wishlist.findOne({ userId: userId }).populate('products');

    if (wishlist) {
      res.status(200).json(wishlist);
    } else {
      res.status(404).json({
        message: 'Wishlist not found'
      });
    }
  } catch (error) {
    console.log('Get Wishlist', error);
    res.status(500).json({
      error: error
    });
  }
};





exports.deleteProductFromWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: userId },
      { $pull: { products: productId } },
      { new: true }
    );

    if (!wishlist) {
      return res.status(400).json({ message: 'Product not found in the wishlist' });
    }

    res.status(200).json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.log('Delete from Wishlist', error);
    res.status(500).json({ error: error.message });
  }
};



