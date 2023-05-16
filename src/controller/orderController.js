const dotenv = require('dotenv');
dotenv.config();
const Order = require('../models/order');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const Product = require('../models/products')
// const { default: orders } = require('razorpay/dist/types/orders');


exports.createOrder = async (req, res) => {
  const { name, userId, address, amount, products } = req.body;

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
      name: name,
      userId: userId,
      address: address,
      amount: amount,
      products: products.map(product => ({
        product: product.id,
        seller: product.seller,
        quantity: product.quantity,
      })),
      status: 'placed',
      paymentId: order.id
    });

    const savedOrder = await newOrder.save();

    // Increment sold count for each product and seller
    for (const product of products) {
      await Product.findOneAndUpdate(
        { _id: product.productId, seller: product.seller },
        { $inc: { soldCount: product.quantity } }
      );
    }

    // Get the count of products sold by each seller
    const sellerSoldCounts = await Product.aggregate([
      {
        $match: {
          _id: { $in: products.map(product => product.productId) }
        }
      },
      {
        $group: {
          _id: '$seller',
          soldCount: { $sum: '$soldCount' }
        }
      }
    ]);

    res.json({ orderId: savedOrder._id, razorpayOrderId: order, sellerSoldCounts });
  } catch (error) {
    console.error('Create order error=========>', error);
    res.status(500).json({ error: 'Unable to create order' });
  }
};



// Update an order
exports.updateOrder = async (req, res) => {
  const { paymentId } = req.body;

  try {
    // Capture the payment
    const razorpay = new Razorpay({
      key_id: 'rzp_test_Tiv5oHxAC3kTlH',
      key_secret: 'oCleWUV3s6qvUbqTsWSB0C89'
    });
    const payment = await razorpay.payments.fetch(paymentId);
 
    const id = payment.order_id
  
    // Update the order status
    const order = await Order.findOne({paymentId: id });

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



exports.getSingleOrder = async function (req, res) {
  try {
    const { id } = req.params;
   

    const order = await Order.findById(id).populate('products');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderWithProductDetails = {
      id: order._id,
      name : order.name,
      userId: order.userId,
      address: order.address,
      amount: order.amount,
      status: order.status,
      paymentId: order.paymentId,
        products: await Promise.all(order.products.map(async (productId) => {
          const product = await Product.findById(productId);
          return {
            id: product._id,
            title: product.title,
            description: product.description,
            price: product.price,
            thumbnail: product.thumbnail,
            rating: product.rating,
            discountPercentage: product.discountPercentage,
            stock: product.stock,
            images: product.images,
            brand: product.brand,
            category: product.category,
            quantity : product.quantity
          };
        })),
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
      };
      res.status(200).json(orderWithProductDetails);
    } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

