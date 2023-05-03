const mongoose = require('mongoose');

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
    // required: true
  },
  seller : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Seller',
    // required : true
  }
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
