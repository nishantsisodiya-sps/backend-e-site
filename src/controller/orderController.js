const Order = require('../models/order');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();

// Create a new order
exports.createOrder = async (req, res) => {
  const { userId, address, amount } = req.body;
  console.log('id=======>' , req.body.userId);
 

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const payment_capture = 1;
    const currency = 'INR';

    const options = {
      amount: amount,
      currency,
      receipt: uuidv4(),
      payment_capture,
    };

    // Create order in Razorpay
    const order = await razorpay.orders.create(options);

    // Create order in our database
    const newOrder = new Order({
      user: userId,
      address : address,
      amount : amount,
      razorpayOrderId: order.id,
      status: 'placed',
    });

    const savedOrder = await newOrder.save();

    res.json({ orderId: savedOrder._id, razorpayOrderId: order.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create order' });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  const { orderId, paymentId, signature } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Verify the payment signature
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const generatedSignature = razorpay.webhook.generateDigest(
      JSON.stringify(req.body),
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (generatedSignature !== signature)
      return res.status(400).json({ error: 'Invalid signature' });

    // Capture the payment
    const payment = await razorpay.payments.capture(paymentId);

    // Update the order status
    order.paymentId = paymentId;
    order.status = 'PAID';
    const savedOrder = await order.save();

    res.json({ orderId: savedOrder._id, status: savedOrder.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to update order' });
  }
};


