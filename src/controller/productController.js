const uploadMiddleware = require('../middleware/uploadMiddleware');
const products = require('../models/products');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose')
const Wishlist = require('../models/wishlist')

//<<<<<<<====================== ADD PRODUCTS API ================>>>>>>>>


exports.addProduct = async (req, res) => {
  // Validate the request body
  const thumbnail = req.files['thumbnail'][0].filename;
  const images = req.files['images'].map(file => file.filename)
  const title = req.body.title
  const description = req.body.description
  const price = req.body.price
  const discountPercentage = req.body.discountPercentage
  const rating = req.body.rating
  const stock = req.body.stock
  const category = new mongoose.Types.ObjectId(req.body.category)
  const brand = req.body.brand
  const seller = req.seller._id
  
 

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  uploadMiddleware.upload(req, res, function (err) {
    if (err) {
      console.log(err);
    }
    // Create a new product instance with uploaded file names
    const product = new products({
      title: title,
      description: description,
      price: price,
      discountPercentage: discountPercentage,
      rating: rating,
      stock: stock,
      brand: brand,
      category: category,
      thumbnail: thumbnail,
      images: images,
      seller: seller
    });

    // Save the product to MongoDB
    product.save()
      .then(product => {
        res.send(product);
      })
      .catch(err => console.log(err));
  })
}


//<<<<<<<======================  GET PRODUCT API ================>>>>>>>>


// exports.getProducts = async function (req, res, next) {

//   try {
//     const page = parseInt(req.query.page) || 1; // Getting the current page from the query parameters, default to 1
//     const limit = 10; // Setting the limit of products per page to 10

//     const count = await products.countDocuments(); //to Count the total number of products
//     const totalPages = Math.ceil(count / limit); //to Calculate the total number of pages\


//     const products1 = await products.find()
//       .skip((page - 1) * limit) //to Skip the products that have been displayed in the previous pages
//       .limit(limit); //to Limit the number of products to be displayed on this page

//     res.status(200).json({
//       totalPages: totalPages,
//       currentPage: page,
//       products: products1
//     });
//   } catch (error) {
//     console.log('error:', error);
//     res.status(500).json({ message: error.message });
//   }
// }





exports.getProducts = async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1; // Getting the current page from the query parameters, default to 1
    const limit = 10; // Setting the limit of products per page to 10

    const count = await products.countDocuments(); // Count the total number of products
    const totalPages = Math.ceil(count / limit); // Calculate the total number of pages

    let products1 = await products.find()
      .skip((page - 1) * limit) // Skip the products that have been displayed in the previous pages
      .limit(limit); // Limit the number of products to be displayed on this page

    if (req.user) {
      const userId = req.user._id;
      const wishlist = await Wishlist.findOne({ userId: userId });

      // Add the isWishlist field in the product details for each product
      products1 = products1.map(product => {
        const isProductInWishlist = wishlist && wishlist.products.includes(product._id);
        return { ...product.toObject(), isWishlist: isProductInWishlist };
      });
    }

    res.status(200).json({
      totalPages: totalPages,
      currentPage: page,
      products: products1
    });
  } catch (error) {
    console.log('error:', error);
    res.status(500).json({ message: error.message });
  }
};

//<<<<<<<======================  FETCH PRODUCT BY SELLER ID API ================>>>>>>>>

exports.getSellerProducts = async function (req, res, next) {
  const seller = req.params.sellerId;

  if (!mongoose.Types.ObjectId.isValid(seller)) {
    return res.status(400).send('Invalid sellerId');
  }

  try {
    const Myproducts = await products.find({ seller });
    res.send(Myproducts);
  } catch (err) {
    return next(err);
  }
};


//<<<<<<<======================  GET SINGLE PRODUCT API ================>>>>>>>>

// exports.getSingleProduct = async function (req, res, next) {
//   try {
//     const productId = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(404).send('Invalid product ID');
//     }
//     const product = await products.findById(productId);
//     if (!product) {
//       return res.status(404).send('Product not found');
//     }
//     res.send(product);
//   } catch (error) {
//     console.log('Get single product error', error);
//     res.status(500).json({ message: error.message });
//   }
// }


exports.getSingleProduct = async function (req, res, next) {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(404).send('Invalid product ID');
    }
    const product = await products.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    if (req.user) {
      // Check if the product is in the wishlist for the logged-in user
      const userId = req.user._id; // Assuming you have user information available in the request
      const wishlist = await Wishlist.findOne({ userId: userId });
      const isProductInWishlist = wishlist && wishlist.products.includes(productId);
      console.log(isProductInWishlist);

      // Add the isWishlist field in the product details
      product.isWishlist = isProductInWishlist;
    }

    res.send(product);
  } catch (error) {
    console.log('Get single product error', error);
    res.status(500).json({ message: error.message });
  }
};




//<<<<<<<======================  DELETE PRODUCT API ================>>>>>>>>


exports.deleteProduct = async function (req, res, next) {
  try {

    const sellerId = req.seller._id
    const productId = req.params.id;

    const Product = await products.findOne({ _id: productId, seller: sellerId })
   
    if (!Product) {
      return res.status(404).json({ message: 'Product Not Found' })
    }
    await products.findByIdAndDelete(productId)
    res.status(200).json({ message: 'Product Deleted successfully' });

  } catch (error) {

    console.log('Delete prduct error ===>', error);
    res.status(500).json({ message: error.message })

  }

}


//<<<<<<<======================  UPDATE PRODUCT API ================>>>>>>>>


exports.updateProduct = async function (req, res) {
  try {
  
    const sellerId = req.seller._id;
    const productId = req.params.id;

    const product = await products.findOne({ _id: productId, seller: sellerId });

    if (!product) {
      return res.status(404).json({ message: 'Product Not Found' });
    }

    const updatedProduct = await products.findByIdAndUpdate(
      productId,
      {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        discountPercentage: req.body.discountPercentage,
        rating: req.body.rating,
        brand: req.body.brand,
        stock: req.body.stock,
        category: req.body.category,
        thumbnail: req.body.thumbnail,
        images: req.body.images
      },
      { new: true }
    );

    res.status(200).json({ message: 'Product Updated successfully', product: updatedProduct });
  } catch (error) {
    console.log('Update product error ===>', error);
    res.status(500).json({ message: error.message });
  }
};





//<<<<<<<======================search product ================>>>>>>>>



exports.searchProduct = async (req, res) => {

  const { query } = req;

  try {
    // Build query object
    const queryObj = {};
    if (query.title && typeof query.title === 'string') {
      queryObj.title = { $regex: query.title, $options: 'i' };
    }
    if (query.description && typeof query.description === 'string') {
      queryObj.description = { $regex: query.description, $options: 'i' };
    }
    // Execute query and return results
    const Myproducts = await products.find(queryObj);
    res.json(Myproducts);
  } 
  catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

