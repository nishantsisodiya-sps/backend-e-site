const uploadMiddleware = require('../middleware/uploadMiddleware');
const products = require('../models/products');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose')

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
  const seller = req.params.sellerId;

  if (!mongoose.Types.ObjectId.isValid(seller)) {
    return res.status(400).send('Invalid sellerId');
  }

  try {
    const Myproducts = await products.find({seller});
    res.send(Myproducts);
  } catch (err) {
    return next(err);
  }
};


exports.getSingleProduct = async function (req, res, next) {

  try {

    const productId = req.params.id;
    const product = await products.findById(productId) 
    
      if (!product) {
        return res.status(404).send('Product not found');
      }
      res.send(product);

  } catch (error) {

    console.log('Get single product error' , error);
    res.status(500).json({message : error.message})
  }

  }


  //Delete Product Api


exports.deleteProduct = async function (req , res , next){
  try {
    
    const sellerId = req.seller._id
    const productId = req.params.id;
    
    const Product = await products.findOne({_id : productId , seller : sellerId})
    console.log(Product);
    if(!Product){
      return res.status(404).json({message : 'Product Not Found'})
    }
    await products.findByIdAndDelete(productId)
    res.status(200).json({message : 'Product Deleted successfully'});

  } catch (error) {

    console.log('Delete prduct error ===>' ,error);
    res.status(500).json({message : error.message})

  }

}


  // Update product API 
  exports.updateProduct = async function(req, res) {
    try {
      console.log('file =========>',req.files.thumbnail[`filename`]);
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
  
      // console.log(updatedProduct);
  
      res.status(200).json({ message: 'Product Updated successfully', product: updatedProduct });
    } catch (error) {
      console.log('Update product error ===>', error);
      res.status(500).json({ message: error.message });
    }
  };
