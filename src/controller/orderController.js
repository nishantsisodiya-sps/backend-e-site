const Order = require('../models/order');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();

// Create a new order

exports.createOrder = async (req, res) => {
  const { userId, address, amount } = req.body;

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
    console.log('order id=====>' ,order);
    // Create order in our database
    const newOrder = new Order({
      userId: userId,
      address: address,
      amount: amount,
      status: 'placed',
      paymentId: order.id
    });

    const savedOrder = await newOrder.save();

    res.json({ orderId: savedOrder._id, razorpayOrderId: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create order' });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  const { paymentId, signature } = req.body;

  try {
    // Verify the payment signature
    const razorpay = new Razorpay({
      key_id: 'rzp_test_Tiv5oHxAC3kTlH',
      key_secret: 'oCleWUV3s6qvUbqTsWSB0C89',
    });

    const generatedSignature = razorpay.webhook.generateDigest(
      JSON.stringify(req.body),
      process.env.RAZORPAY_TEST_WEBHOOK_SECRET
    );

    if (generatedSignature !== signature)
      return res.status(400).json({ error: 'Invalid signature' });

    // Capture the payment
    const payment = await razorpay.payments.capture(paymentId);

    // Update the order status
    const order = await Order.findOne({ paymentId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
      console.log('order======>' , order);
    order.status = 'PAID';
    const savedOrder = await order.save();

    res.json({ orderId: savedOrder._id, status: savedOrder.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to update order' });
  }
};






