const uploadMiddleware = require('../middleware/uploadMiddleware');
const products = require('../models/products');
const { validationResult } = require('express-validator');


exports.addProduct = async (req, res) => {
  // Validate the request body
  const thumbnail = req.files['thumbnail'][0].filename;
  const images = req.files['images'].map(file => file.filename)
  const title = req.body.title
  const description = req.body.description
  const price = req.body.price
  const discountPercentage= req.body.discountPercentage
  const rating= req.body.rating
  const stock= req.body.stock
  const category= req.body.category
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
      brand : brand,
      category: category,
      thumbnail: thumbnail,
      images: images,
      seller : seller
    });

    // Save the product to MongoDB
    product.save()
      .then(product => {
        res.send(product);
      })
      .catch(err => console.log(err));
  })
}



exports.getProducts = async function (req, res, next) {

  try {
    const page = parseInt(req.query.page) || 1; // Getting the current page from the query parameters, default to 1
    const limit = 5; // Setting the limit of products per page to 5

    const count = await products.countDocuments(); //to Count the total number of products
    const totalPages = Math.ceil(count / limit); //to Calculate the total number of pages\


    const products1 = await products.find()
      .skip((page - 1) * limit) //to Skip the products that have been displayed in the previous pages
      .limit(limit); //to Limit the number of products to be displayed on this page

    res.status(200).json({
      totalPages: totalPages,
      currentPage: page,
      products: products1
    });
  } catch (error) {
    console.log('error:', error);
    res.status(500).json({ message: error.message });
  }
}


exports.getSellerProducts = async function (req, res, next) {
  const sellerId = req.params.sellerId;

  await products.findById({ sellerId: sellerId })
    .exec(function (err, products) {
      if (err) {
        return next(err);
      }

      res.send(products);
    });
};




exports.getSingleProduct = async function (req, res, next) {
  const productId = req.params.id;
  console.log(productId);
  const product = await products.findById(productId) 
  
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.send(product);
  }