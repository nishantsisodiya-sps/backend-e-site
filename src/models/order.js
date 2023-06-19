const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  PaymentStatus: {
    type: String,
    enum: ['COD', 'PAID',],
    default: 'COD'
  },
  paymentId: {
    type: String,
    required: true
  },


  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
      },
      seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
      },
      quantity: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ['Placed', 'Packed', 'Shipped', 'Delivered'],
        default: 'Placed',
      },
      shippingDetails: {
        type: String,
        required: false,
      },
    }
  ]
},
  {
    timestamps: true
  });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
