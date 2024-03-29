const dotenv = require("dotenv");
dotenv.config();
const Order = require("../models/order");
const Razorpay = require("razorpay");
const { v4: uuidv4 } = require("uuid");
const Product = require("../models/products");
const Cart = require("../models/cart");
// const { default: orders } = require('razorpay/dist/types/orders');
const {
  transporter,
  sendEmail,
  getSellerEmailById,
  getUserEmailById,
} = require("../services/emailSender");
const notificationController = require("../controller/notificationController");
const redis = require("redis");
const client = redis.createClient({ legacyMode: true });
client.connect();

// Handle Redis client errors
client.on("error", (error) => {
  console.error("Redis client error:", error);
});

//<<<<<<<======================  CREATE AND SAVE A NEW ORDER ================>>>>>>>>

exports.createOrder = async (req, res) => {
  const { name, userId, address, amount, products, deviceToken } = req.body;

  try {
    const razorpay = new Razorpay({
      key_id: "rzp_test_Tiv5oHxAC3kTlH",
      key_secret: "oCleWUV3s6qvUbqTsWSB0C89",
    });

    const payment_capture = 1;
    const currency = "INR";

    const options = {
      amount: amount,
      currency,
      receipt: uuidv4(),
      payment_capture,
      notes: {
        mode: "test",
      },
    };

    // Create order in Razorpay
    const order = await razorpay.orders.create(options);

    // Calculate expected delivery date
    const createDate = new Date();
    const expectedDeliveryDate = new Date(createDate);
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 5);

    while (expectedDeliveryDate.getDate() <= createDate.getDate()) {
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 1);

      if (expectedDeliveryDate.getMonth() !== createDate.getMonth()) {
        expectedDeliveryDate.setDate(0); // Set to the last day of the current month
        expectedDeliveryDate.setMonth(createDate.getMonth() + 1); // Increment the month
      }
    }

    // Create order in our database
    const newOrder = new Order({
      name: name,
      userId: userId,
      address: address,
      amount: amount,
      products: products.map((product) => ({
        product: product.id,
        seller: product.seller,
        quantity: product.quantity,
      })),
      status: "COD",
      paymentId: order.id,
      expectedDeliveryDate: expectedDeliveryDate,
    });

    const savedOrder = await newOrder.save();

    // Send order details as an object
    const orderDetails = {
      id: savedOrder._id,
      name: savedOrder.name,
      amount: savedOrder.amount,
    };

    // Send notification to the driver
    await notificationController.sendNotification_OneByOne(
      orderDetails,
      deviceToken
    );

    // Decrement the stock of each product
    for (const product of products) {
      const productDoc = await Product.findById(product.id);
    
      if (!productDoc) {
        res.status(404).json({ msg: "Product not found" });
        continue;
      }

      const remainingStock = productDoc.stock - product.quantity;
      productDoc.stock = remainingStock >= 0 ? remainingStock : 0;
      await productDoc.save();
    }

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
          _id: { $in: products.map((product) => product.productId) },
        },
      },
      {
        $group: {
          _id: "$seller",
          soldCount: { $sum: "$soldCount" },
        },
      },
    ]);

    for (const product of products) {
      try {
        const sellerEmail = await getSellerEmailById(product.seller); // Await the function call to resolve the Promise
        const emailSubject = "New Order Notification";
        const emailText = `Hello,

        You have received a new order with ID ${savedOrder._id}.
    
        Product Details:
        - Name: ${product.name}
        - Quantity: ${product.quantity}
    
        Thank you for your business!
    
        Regards,
        Nishant Sisodiya (Founder , Apna Market)`;
        // Get user email by user Id
        const userEmail = await getUserEmailById(userId);
        // Send email to the user with the list of purchased products
        const emailSubjectUser = "Order Confirmation";
        const emailTextUser = `Hello,

    Thank you for your order! Here are the details of your purchase:

    Order ID: ${savedOrder._id}

    Products:
    ${products
      .map((product) => `- ${product.title} (Quantity: ${product.quantity})`)
      .join("\n")}

    Total Amount: ${amount} INR

    If you have any questions or need further assistance, please feel free to contact us.

    Regards,
    Nishant Sisodiya (Founder , Apna Market)`;

        await sendEmail(sellerEmail, emailSubject, emailText);
        await sendEmail(userEmail, emailSubjectUser, emailTextUser);
      } catch (error) {
        console.error("Error getting seller email:", error);
        // Handle the error appropriately (e.g., log, throw, or continue with the loop)
      }
    }

    res.json({
      orderId: savedOrder._id,
      razorpayOrderId: order,
      sellerSoldCounts,
    });
  } catch (error) {
    console.error("Create order error=========>", error);
    res.status(500).json({ error: "Unable to create order" });
  }
};

//<<<<<<<======================  UPDATE THE CREATED ORDER AFTER PAYMENT ================>>>>>>>>

// Update an order
exports.updateOrder = async (req, res) => {
  const { paymentId } = req.body;

  try {
    // Capture the payment
    const razorpay = new Razorpay({
      key_id: "rzp_test_Tiv5oHxAC3kTlH",
      key_secret: "oCleWUV3s6qvUbqTsWSB0C89",
    });
    const payment = await razorpay.payments.fetch(paymentId);

    const id = payment.order_id;

    // Update the order status
    const order = await Order.findOne({ paymentId: id });

    if (!order) return res.status(404).json({ error: "Order not found" });

    if (payment.status === "captured") {
      order.PaymentStatus = "PAID";
      await Cart.deleteMany({ user: savedOrder.userId });
      const savedOrder = await order.save();

      // Clear user's cart

      res.json({ orderId: savedOrder._id, status: savedOrder.status });
    } else if (payment.status === "COD") {
      await Cart.deleteMany({ user: savedOrder.userId });

      res.json({ orderId: savedOrder._id, status: savedOrder.status });
    } else {
      res.json({ status: payment.status });
    }
  } catch (error) {
    console.error("Update order error=======>", error);
    res.status(500).json({ error: "Unable to update order" });
  }
};

//<<<<<<<====================== GET ALL THE ORDERS ================>>>>>>>>

exports.getOrders = async (req, res) => {
  try {
    const userId = req.params.id;
    const cacheKey = `orders:${userId}`;

    client.get(cacheKey, async (err, cachedData) => {
      if (err) {
        console.error("Redis get error:", err);
      }

      if (cachedData) {
        const ordersWithProductDetails = JSON.parse(cachedData);
        return res.status(200).json(ordersWithProductDetails);
      }

      let myOrders;
      if (userId) {
        myOrders = await Order.find({ userId }).populate("products.product");
      } else {
        return res.status(400).send("Please provide either userId or sellerId");
      }

      if (myOrders.length === 0) {
        return res.status(404).json({ msg: "Orders not found" });
      }

      const ordersWithProductDetails = [];
      for (const order of myOrders) {
        for (const myproduct of order.products) {
          const productDetails = await Product.findById(myproduct.product._id);
          const orderWithProductDetails = {
            _id: order._id,
            userId: order.userId,
            name: order.name,
            address: order.address,
            amount: order.amount,
            PaymentStatus: order.PaymentStatus,
            paymentId: order.paymentId,
            product: {
              product: productDetails,
              seller: myproduct.seller,
              quantity: myproduct.quantity,
              status: myproduct.status,
              shippingDetails: myproduct.shippingDetails,
            },
            expectedDeliveryDate: order.expectedDeliveryDate,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          };
          ordersWithProductDetails.push(orderWithProductDetails);
        }
      }

      ordersWithProductDetails.sort((a, b) => b.createdAt - a.createdAt);

      client.setEx(cacheKey, 3600, JSON.stringify(ordersWithProductDetails));

      res.status(200).json(ordersWithProductDetails);
    });
  } catch (error) {
    console.log("getOrders error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//<<<<<<<======================  GET SINGLE ORDER ================>>>>>>>>

exports.getSingleOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const productId = req.body.productId;
    const cacheKey = `singleOrder:${orderId}:${productId}`;

    client.get(cacheKey, async (err, cachedData) => {
      if (err) {
        console.error("Redis get error:", err);
      }

      if (cachedData) {
        const orderWithProductDetails = JSON.parse(cachedData);
        return res.status(200).json(orderWithProductDetails);
      }

      const order = await Order.findById(orderId).populate("products.product");
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const productItem = order.products.find(
        (item) => item.product._id.toString() === productId
      );
      if (!productItem) {
        return res.status(404).json({ message: "Product not found in order" });
      }

      const product = productItem.product;
      const seller = productItem.seller;
      const quantity = productItem.quantity;

      let sellerSoldCount = 0;
      if (product && seller) {
        const sellerSoldCounts = await Product.aggregate([
          { $match: { _id: product, seller } },
          { $group: { _id: "$seller", soldCount: { $sum: "$soldCount" } } },
        ]);
        if (sellerSoldCounts.length > 0) {
          sellerSoldCount = sellerSoldCounts[0].soldCount;
        }
      }

      const productDetails = {
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
        sellerSoldCount,
      };

      const orderWithProductDetails = {
        id: order._id,
        name: order.name,
        userId: order.userId,
        address: order.address,
        amount: order.amount,
        status: productItem.status,
        paymentId: order.paymentId,
        products: [productDetails],
        shippingDetails: productItem.shippingDetails,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        expectedDeliveryDate: order.expectedDeliveryDate,
      };

      client.setEx(cacheKey, 3600, JSON.stringify(orderWithProductDetails));

      res.status(200).json(orderWithProductDetails);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

//<<<<<<<======================  DELETE ALL THE ORDERS FOR PERTICULAR USER ================>>>>>>>>

exports.deleteAllOrders = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID not provided" });
    }

    // Delete all orders with the specified userId
    await Order.deleteMany({ userId });

    res.status(200).json({ message: "All orders deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Unable to delete orders" });
  }
};

//<<<<<<<======================  CANCLE ORDER ================>>>>>>>>

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    // Find the order by orderId
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Find the product in the order's products array with the given product ID
    const product = order.products.find(
      (product) => product.product.toString() === productId
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found in the order" });
    }

    // Update the product's status to "Cancelled"
    product.status = "Cancelled";

    // Save the updated order
    const updatedOrder = await order.save();

    // Send cancellation email to the product seller
    const sellerEmail = await getSellerEmailById(product.seller);
    const emailSubjectSeller = "Order Cancellation";
    const emailTextSeller = `Hello,

    The following order has been cancelled:

    Order ID: ${updatedOrder._id}
    Product: ${product.product.title}
    Quantity: ${product.quantity}

    If you have any questions or need further assistance, please feel free to contact us.

    Regards,
    Nishant Sisodiya (Founder, Apna Market)`;

    await sendEmail(sellerEmail, emailSubjectSeller, emailTextSeller);

    // Send cancellation email to the user
    const userEmail = await getUserEmailById(updatedOrder.userId);
    const emailSubjectUser = "Order Cancellation";
    const emailTextUser = `Hello,

    Your order with ID ${updatedOrder._id} has been cancelled.

    If you have any questions or need further assistance, please feel free to contact us.

    Regards,
    Nishant Sisodiya (Founder, Apna Market)`;

    await sendEmail(userEmail, emailSubjectUser, emailTextUser);

    res.json(updatedOrder);
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ error: "Unable to cancel order" });
  }
};
