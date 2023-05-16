const mongoose = require('mongoose');
const validator = require('validator')

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        return validator.isLength(value, { min: 10, max: 500 });
      },
      message: 'Description must be between 10 and 500 characters'
    }
  },
  price: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => {
        return validator.isFloat(String(value), { min: 0 });
      },
      message: 'Price must be a positive number'
    }
  },
  discountPercentage: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => {
        return validator.isFloat(String(value), { min: 0, max: 100 });
      },
      message: 'Discount percentage must be between 0 and 100'
    }
  },
  rating: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => {
        return validator.isFloat(String(value), { min: 0, max: 5 });
      },
      message: 'Rating must be between 0 and 5'
    }
  },
  brand:{
    type : String,
    required : true
  },
  stock: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => {
        return validator.isInt(String(value), { min: 0 });
      },
      message: 'Stock must be a non-negative integer'
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    validate: {
      validator: async function(v) {
        const category = await mongoose.model('ProductCategory').findById(v);
        return category !== null;
      },
      message: 'Category is invalid'
    }
  },
  seller : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Seller',
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  images: [String],
});

module.exports = mongoose.model('product', productSchema);
