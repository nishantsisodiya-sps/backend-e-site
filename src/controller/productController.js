const uploadMiddleware = require('../middleware/uploadMiddleware');
const products = require('../models/products')

exports.addProduct = async (req, res) => {
  // Validate the request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Create a new product instance with uploaded file names and the seller id
  const product = new products({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    discountPercentage: req.body.discountPercentage,
    rating: req.body.rating,
    brand: req.body.brand,
    stock: req.body.stock,
    category: req.body.category,
    seller: req.user.id, // Get seller id from authenticated user
    thumbnail: req.files['thumbnail'][0].filename,
    images: req.files['images'].map((file) => file.filename),
  });

  // Save the product to MongoDB
  try {
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).send('Server error');
  }
};



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
  const productId = req.params.productId;

  await products.findById(productId, function (err, product) {
    if (err) {
      return next(err);
    }

    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.send(product);
  });
};