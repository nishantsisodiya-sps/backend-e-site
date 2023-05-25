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
























// const Wishlist = require('../models/wishlist');
// const Product = require('../models/products');



// exports.addProductToWishlist = async (req, res) => {
//   const { productId } = req.body;
//   const userId = req.user._id; // Assuming you have user information available in the request

//   try {
//     // Find or create the user's wishlist
//     let wishlist = await Wishlist.findOne({ userId: userId });

//     if (!wishlist) {
//       wishlist = await Wishlist.create({ userId: userId, products: [] });
//     }

//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     const productIndex = wishlist.products.indexOf(productId);
//     const isProductInWishlist = productIndex !== -1;

//     if (isProductInWishlist) {
//       // Product is already in the wishlist, so remove it
//       wishlist.products.splice(productIndex, 1);

//       // Update wishlist flag in the Product schema for the logged-in user
//       product.wishlist = false;
//     } else {
//       // Product is not in the wishlist, so add it
//       wishlist.products.push(productId);

//       // Update wishlist flag in the Product schema for the logged-in user
//       product.wishlist = true;
//     }

//     await wishlist.save();
//     await product.save();

//     res.json({ wishlist, product });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Failed to add/remove product from wishlist' });
//   }
// };



// exports.addProductToWishlist = async (req, res) => {
//   const { productId } = req.body;
//   const userId = req.user._id; // Assuming you have user information available in the request

//   try {
//     // Find or create the user's wishlist
//     let wishlist = await Wishlist.findOne({ userId: userId });

//     if (!wishlist) {
//       wishlist = await Wishlist.create({ userId: userId, products: [] });
//     }

//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     const productIndex = wishlist.products.indexOf(productId);
//     const isProductInWishlist = productIndex !== -1;

//     if (isProductInWishlist) {
//       // Product is already in the wishlist, so remove it
//       wishlist.products.splice(productIndex, 1);
//     } else {
//       // Product is not in the wishlist, so add it
//       wishlist.products.push(productId);
//     }

//     await wishlist.save();

//     // Update wishlist flag in the Product schema for the logged-in user
//     product.wishlist = wishlist.products.includes(productId);
//     await product.save();

//     res.json({ wishlist, product });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Failed to add/remove product from wishlist' });
//   }
// };


// exports.getWishlist = async (req, res) => {
//   const { userId } = req.user; // Assuming you have user information available in the request

//   try {
//     const wishlist = await Wishlist.findOne({ user: userId }).populate('products');

//     if (!wishlist) {
//       return res.status(404).json({ error: 'Wishlist not found' });
//     }

//     // Get the product IDs in the wishlist
//     const productIds = wishlist.products.map((product) => product.toString());

//     // Retrieve the products from the Product schema with wishlist flag
//     const products = await Product.find({ _id: { $in: productIds }, 'wishlist.user': userId });

//     res.json({ wishlist: { ...wishlist.toObject(), products } });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Failed to retrieve wishlist' });
//   }
// };



exports.deleteProductFromWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { products: productId } },
      { new: true }
    );

    if (!wishlist) {
      return res.status(400).json({ message: 'Product not found in the wishlist' });
    }

    // Update the product's isWishlist flag for the logged-in user
    await Product.updateOne(
      { _id: productId },
      { $pull: { wishlist: userId } }
    );

    res.status(200).json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.log('Delete from Wishlist', error);
    res.status(500).json({ error: error.message });
  }
};
