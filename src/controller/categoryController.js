const Product = require('../models/products');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getProductsByCategory = async (req, res) => {
    const category = req.params.category;
    try {
      const products = await Product.find({ category: category }).populate('seller', 'name email');
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };