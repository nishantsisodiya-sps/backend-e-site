const uploadMiddleware = require('../middleware/uploadMiddleware');
const products = require('../models/products');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Wishlist = require('../models/wishlist');
const redis = require('redis');
const client = redis.createClient({ legacyMode: true });
client.connect();

// Handle Redis client errors
client.on('error', (error) => {
  console.error('Redis client error:', error);
});


//<<<<<<<====================== ADD PRODUCTS API ================>>>>>>>>



exports.addProduct = async (req, res) => {
  // Validate the request body
  const thumbnail = req.files['thumbnail'][0].filename;
  const images = req.files['images'].map((file) => file.filename);
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const discountPercentage = req.body.discountPercentage;
  const rating = req.body.rating;
  const stock = req.body.stock;
  const category = new mongoose.Types.ObjectId(req.body.category);
  const brand = req.body.brand;
  const seller = req.seller._id;

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
      seller: seller,
    });

    // Save the product to MongoDB
    product
      .save()
      .then((product) => {
        // Invalidate the products cache
        invalidateCache('products:*');
        res.send(product);
      })
      .catch((err) => console.log(err));
  });
};



//<<<<<<<======================  GET PRODUCT API ================>>>>>>>>



exports.getProducts = async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    // Check if products are cached in Redis
    client.get(`products:page${page}`, async (error, cachedProducts) => {
      if (error) {
        console.error(error);
      }

      if (cachedProducts) {
        // If products are cached, return the cached products
        const parsedProducts = JSON.parse(cachedProducts);
        res.status(200).json(parsedProducts);
      } else {
        // If products are not cached, query the database and cache the result
        const count = await products.countDocuments();
        const totalPages = Math.ceil(count / limit);

        const products1 = await products
          .find()
          .skip((page - 1) * limit)
          .limit(limit);

        const response = {
          totalPages: totalPages,
          currentPage: page,
          products: products1,
        };

        // Cache the products in Redis
        client.setex(`products:page${page}`, 3600, JSON.stringify(response));

        res.status(200).json(response);
      }
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



exports.getSingleProduct = async function (req, res, next) {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(404).send('Invalid product ID');
    }

    // Check if the product is cached in Redis
    client.get(`product:${productId}`, async (error, cachedProduct) => {
      if (error) {
        console.error(error);
      }

      if (cachedProduct) {
        // If the product is cached, return the cached product
        const parsedProduct = JSON.parse(cachedProduct);
        res.send(parsedProduct);
      } else {
        // If the product is not cached, query the database and cache the result
        const product = await products.findById(productId);
        if (!product) {
          return res.status(404).send('Product not found');
        }

        let isProductInWishlist = false;

        if (req.user && req.user._id !== 'guest') {
          const userId = new mongoose.Types.ObjectId(req.user._id);
          const wishlist = await Wishlist.findOne({ userId: userId });
          if (wishlist && wishlist.products.includes(productId)) {
            isProductInWishlist = true;
          }
        }

        // Add the isWishlist field in the product details
        product.isWishlist = isProductInWishlist;

        // Cache the product in Redis
        client.setex(`product:${productId}`, 3600, JSON.stringify(product));

        res.send(product);
      }
    });
  } catch (error) {
    console.log('Get single product error', error);
    res.status(500).json({ message: error.message });
  }
};



//<<<<<<<======================  DELETE PRODUCT API ================>>>>>>>>



exports.deleteProduct = async function (req, res, next) {
  try {
    const sellerId = req.seller._id;
    const productId = req.params.id;

    const Product = await products.findOne({ _id: productId, seller: sellerId });

    if (!Product) {
      return res.status(404).json({ message: 'Product Not Found' });
    }

    await products.findByIdAndDelete(productId);

    // Invalidate the products cache and single product cache
    invalidateCache(`products:page*`);
    invalidateCache(`product:${productId}`);

    res.status(200).json({ message: 'Product Deleted successfully' });
  } catch (error) {
    console.log('Delete product error ===>', error);
    res.status(500).json({ message: error.message });
  }
};



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
        images: req.body.images,
      },
      { new: true }
    );

    // Invalidate the products cache and single product cache
    invalidateCache(`products:page*`);
    invalidateCache(`product:${productId}`);

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
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//<<<<<<<====================== Function to invalidate the cache for a specific key or pattern ================>>>>>>>>

function invalidateCache(keyPattern) {
  client.keys(keyPattern, (error, keys) => {
    if (error) {
      console.error(error);
    }

    if (keys.length > 0) {
      client.del(keys, (delError, count) => {
        if (delError) {
          console.error(delError);
        }
        console.log(`Cache cleared for keys: ${keys}. Count: ${count}`);
      });
    }
  });
}
