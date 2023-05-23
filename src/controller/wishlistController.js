const Wishlist = require('../models/wishlist');




exports.AddProductToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.body.productId;

    // Check if the user has an existing wishlist
    let wishlist = await Wishlist.findOne({ userId: userId });

    // If the wishlist doesn't exist, create a new one for the user
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: userId,
        product: [] // Initialize the 'product' property as an empty array
      });
    }

    // Check if the product already exists in the wishlist
    if (!wishlist.products.includes(productId)) { // Add a condition to check if the 'product' array is defined
      // Add the product to the wishlist
      wishlist.products.push(productId);
      await wishlist.save();
    } else {
      return res.status(400).json({ message: 'Product already exists in the wishlist' });
    }

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
    const userId = req.params.id

    // Fetch the wishlist with populated product details
    const wishlist = await Wishlist.findOne({ userId: userId }).populate('products');

    if (wishlist) {
      res.status(200).send(wishlist)
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



exports.deleteProductFromWishlist = async (req, res) => {
  console.log(req);
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