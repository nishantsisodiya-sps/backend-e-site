const mongoose = require('mongoose');
const validator = require('validator')

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  seller : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Seller',
  }
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
