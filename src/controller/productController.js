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



exports.getProducts =async function (req, res, next) {
    await products.find({}, function (err, products) {
        if (err) {
            return next(err);
        }
        res.send(products);
    });
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




exports.getSingleProduct = async function(req, res, next) {
    const productId = req.params.productId;
  
    await products.findById(productId, function(err, product) {
      if (err) {
        return next(err);
      }
  
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
      res.send(product);
    });
  };