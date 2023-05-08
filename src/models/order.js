const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['placed', 'shipped', 'delivered'],
    default: 'placed'
  },
  paymentId: {
    type: String,
    required: true
  },
  products:
    [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product'
    }],
},
  {
    timestamps: true
  });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
