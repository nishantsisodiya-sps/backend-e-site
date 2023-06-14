const dotenv = require('dotenv');
dotenv.config();
const Order = require('../models/order');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const Product = require('../models/products')
const Cart = require('../models/cart')
// const { default: orders } = require('razorpay/dist/types/orders');
const { transporter, sendEmail , getSellerEmailById} = require('../services/emailSender');


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

    for (const product of products) {
      try {
       
        const sellerEmail = await getSellerEmailById(product.seller); // Await the function call to resolve the Promise
  
        const emailSubject = 'New Order Notification';
        const emailText = ` Hello ,
        You have received a new order with ID ${savedOrder._id}
        
        Thanks & Regards 
        Nishant Sisodiya (Founder , Apna Market)
        
        `
        ;
    
        await sendEmail(sellerEmail, emailSubject, emailText);
      } catch (error) {
        console.error('Error getting seller email:', error);
        // Handle the error appropriately (e.g., log, throw, or continue with the loop)
      }
    }

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
      

      // Clear user's cart
       await Cart.deleteMany({ user: savedOrder.userId });
    

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
    console.log(req.params);
    let Myorders;
    if (userId) {
      Myorders = await Order.find({ userId });
      
    } else {
      return res.status(400).send('Please provide either userId or sellerId');
    }

    if (Myorders.length === 0) {
      return res.status(404).json('Orders not found');
    }

    res.status(200).send(Myorders);
  } catch (error) {
    console.log('getOrders error=====>', error);
    res.status(500).send('Internal Server Error');
  }
};




exports.getSingleOrder = async function (req, res) {
  try {
    
    const id = req.params. id;
    console.log(id);

    const order = await Order.findById(id).populate('products.product');
    console.log(order);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderWithProductDetails = {
      id: order._id,
      name: order.name,
      userId: order.userId,
      address: order.address,
      amount: order.amount,
      status: order.status,
      paymentId: order.paymentId,
      products: await Promise.all(
        order.products.map(async (productItem) => {
          const product = productItem.product;
          const seller = productItem.seller;
          const quantity = productItem.quantity;

          let sellerSoldCount = 0;
          if (product && seller) {
            const sellerSoldCounts = await Product.aggregate([
              { $match: { _id: product, seller } },
              { $group: { _id: '$seller', soldCount: { $sum: '$soldCount' } } }
            ]);
            if (sellerSoldCounts.length > 0) {
              sellerSoldCount = sellerSoldCounts[0].soldCount;
            }
          }
          console.log(product);
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
            quantity,
            sellerSoldCount
          };
        })
      ),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    res.status(200).json(orderWithProductDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};



exports.deleteAllOrders = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(req.params);

    if (!userId) {
      return res.status(400).json({ error: 'User ID not provided' });
    }

    // Delete all orders with the specified userId
    await Order.deleteMany({ userId });

    res.status(200).json({ message: 'All orders deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Unable to delete orders' });
  }
};