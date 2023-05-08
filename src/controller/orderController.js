const dotenv = require('dotenv');
dotenv.config();
const Order = require('../models/order');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
// const { default: orders } = require('razorpay/dist/types/orders');

// Create a new order

exports.createOrder = async (req, res) => {
  const { userId, address, amount , products} = req.body;
  try {
    const razorpay = new Razorpay({
      key_id: 'rzp_test_Tiv5oHxAC3kTlH',
      key_secret: 'oCleWUV3s6qvUbqTsWSB0C89',
    });

    const payment_capture = 1;
    const currency = 'INR';

    const options = {
      amount: amount,
      currency,
      receipt: uuidv4(),
      payment_capture,
      notes: {
        'mode': 'test'
      }
    };
    
    // Create order in Razorpay
    const order = await razorpay.orders.create(options);
    // Create order in our database
    const newOrder = new Order({
      userId: userId,
      address: address,
      amount: amount,
      products : products,
      status: 'placed',
      paymentId: order.id
    });

    const savedOrder = await newOrder.save();

    res.json({ orderId: savedOrder._id, razorpayOrderId: order });
  } catch (error) {
    console.error('Create order error=========>' ,error);
    res.status(500).json({ error: 'Unable to create order' });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  const { paymentId } = req.body;
  console.log('id==>' , req.body);
  try {
    // Capture the payment
    const razorpay = new Razorpay({
      key_id: 'rzp_test_Tiv5oHxAC3kTlH',
      key_secret: 'oCleWUV3s6qvUbqTsWSB0C89'
    });
    const payment = await razorpay.payments.fetch(paymentId);

    // Update the order status
    const order = await Order.findOne({ paymentId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (payment.status === 'captured') {
      order.status = 'PAID';
      const savedOrder = await order.save();
      res.json({ orderId: savedOrder._id, status: savedOrder.status });
    } else {
      res.json({ status: payment.status });
    }
  } catch (error) {
    console.error('Update order error=======>' , error);
    res.status(500).json({ error: 'Unable to update order' });
  }
};


//get orders api


exports.getOrders = async (req, res) => {
  try {
    const userId = req.params.id;
    let Myorders;
    if (userId) {
      Myorders = await Order.find({ userId });
    } else {
      return res.status(400).send('Please provide either userId or sellerId');
    }

    if (Myorders.length === 0) {
      return res.status(404).send('Orders not found');
    }

    res.status(200).send(Myorders);
  } catch (error) {
    console.log('getOrders error=====>', error);
    res.status(500).send('Internal Server Error');
  }
};




