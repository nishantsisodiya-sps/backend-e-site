const Cart = require('../models/cart');
const Product = require('../models/products')

// Add products to Cart

exports.addToCart = async (req, res) => {
  try {
    const { user, product, quantity } = req.body;

    // Check if the product is already in the user's cart
    const existingCartItem = await Cart.findOne({ user, product });

    if (existingCartItem) {
      // If it is, update the quantity
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
    } else {
      // If not, add a new item to the cart
      const cartItem = new Cart({
        user: user,
        product: product,
        quantity: quantity
      });
      await cartItem.save();
    }

    res.status(200).json({ message: 'Product added to cart successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};



//Get Cart products for specific user id

exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cartItems = await Cart.find({ user: userId }).populate('product');

    if (!cartItems) {
      return res.status(404).json({ message: 'Cart not found for the given user' });
    }

    const cartItemsWithProductInfo = await Promise.all(cartItems.map(async (cartItem) => {
      const { product, quantity } = cartItem;

      const productInfo = await Product.findById(product);

      return {
        id: cartItem._id,
        quantity,
        product: {
          id: productInfo._id,
          title: productInfo.title,
          description: productInfo.description,
          price: productInfo.price,
          thumbnail: productInfo.thumbnail,
          rating: productInfo.rating,
          discountPercentage: productInfo.discountPercentage,
          stock: productInfo.stock,
          images: productInfo.images,
          brand: productInfo.brand,
          category: productInfo.category
        },
      };
    }));

    res.status(200).json(cartItemsWithProductInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete products from cart 


exports.DeleteProduct = async (req, res) => {
  try {

    const { user, product } = req.body;

    //// Find the cart item for the user and product
    const cartItem = await Product.findOne({ user, product })

    if (!cartItem) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await cartItem.remove();

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}