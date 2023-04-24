const upload = require('../middlewares/uploadMiddleware');
const products = require('../models/products')

exports.addProduct = function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            return next(err);
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
            images: req.files['images'].map(file => file.filename)
        });

        // Save the product to MongoDB
        product.save(function (err, product) {
            if (err) {
                return next(err);
            }
            res.send(product);
        });
    });
}



exports.getProducts = function (req, res, next) {
    products.find({}, function (err, products) {
        if (err) {
            return next(err);
        }
        res.send(products);
    });
}


exports.getSellerProducts = function (req, res, next) {
    const sellerId = req.params.sellerId;

    products.find({ sellerId: sellerId })
        .exec(function (err, products) {
            if (err) {
                return next(err);
            }

            res.send(products);
        });
};




exports.getSingleProduct = function(req, res, next) {
    const productId = req.params.productId;
  
    products.findById(productId, function(err, product) {
      if (err) {
        return next(err);
      }
  
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
      res.send(product);
    });
  };