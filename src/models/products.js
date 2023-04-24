const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountPercentage: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  brand:{
    type : String,
    required : true
  },
  stock: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
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
