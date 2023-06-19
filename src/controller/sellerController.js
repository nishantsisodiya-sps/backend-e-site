const Seller = require('../models/seller');
const bcrypt = require('bcryptjs');
const Order = require('../models/order');
const mongoose = require('mongoose');
const Product = require('../models/products')


// Register a new seller
exports.registerSeller = async (req, res) => {
  try {
     const { name, email, password, phone } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(409).json({ message: 'Seller already exists' });
    }

    //Creating seller
    const newSeller = new Seller({
      name,
      email,
      password,
      phone,
      tokens: []
    });

    await newSeller.save();

    const authToken = await newSeller.generateAuthToken();


    res.status(201).json({ token : authToken, success: true, message: "Sign in successfully", });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};


// Login a seller
exports.loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
  

    // Check if seller exists
    const existingSeller = await Seller.findOne({ email : email });
    if (!existingSeller) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, existingSeller.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    
    const authToken = await existingSeller.generateAuthToken();
      res.status(200).json({ token:authToken, success: true, message: "Logged in successfully", });
  

  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};



exports.getProfile = async (req, res) => {
  try {
    const sellerId = req.params.id
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    return res.json({ seller });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server Error' });
  }
};




exports.getSoldProductsSeller = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    // Retrieve sold products information for the seller
    const soldProducts = await Order.aggregate([
      {
        $match: {
          'products.seller': new mongoose.Types.ObjectId(sellerId),
          PaymentStatus: { $in: ['PAID', 'shipped', 'delivered'] }
        }
      },
      {
        $unwind: '$products'
      },
      {
        $match: {
          'products.seller': new mongoose.Types.ObjectId(sellerId)
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          _id: 0,
          product: {
            _id: '$product._id',
            name: '$product.name',
            title: '$product.title',
            description: '$product.description',
            price: '$product.price',
            seller: '$product.seller',
            quantity: '$products.quantity',
            status: '$products.status',
            shippingDetails: '$products.shippingDetails',
            address: '$address',
            paymentId: '$paymentId',
            paymentStatus: '$PaymentStatus',
            productName: '$product.name',
            userName : '$name',
            productStatus: {
              $cond: {
                if: { $eq: ['$products.product.status', 'Placed'] },
                then: 'Pending',
                else: '$products.status'
              }
            }
          }
        }
      }
    ]);

    res.status(201).json(soldProducts);
  } catch (error) {
    console.error('Get sold products error:', error);
    res.status(500).json({ error: 'Unable to fetch sold products' });
  }
};





exports.getSoldProducts = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    // Retrieve sold products information for the seller
    const soldProducts = await Order.aggregate([
      {
        $match: {
          'products.seller': new mongoose.Types.ObjectId(sellerId),
          PaymentStatus: { $in: ['PAID', 'shipped', 'delivered'] },
        },
      },
      {
        $unwind: '$products',
      },
      {
        $match: {
          'products.seller': new mongoose.Types.ObjectId(sellerId),
        },
      },
      {
        $group: {
          _id: '$products.product',
          quantitySold: { $sum: '$products.quantity' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $match: {
          'product.seller': new mongoose.Types.ObjectId(sellerId),
        },
      },
    ]);

    res.json(soldProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch sold products.' });
  }
};


exports.getSellers = async (req , res)=>{
  
  try {
    
    const sellers = await Seller.find().select('-tokens -password');

    if(!sellers){
      return res.status(404).json({msg : 'sellers Not Found'})
    }

    res.json(sellers)

  } catch (error) {
    console.log('Get sellers error' , error);
  }

}



exports.updateStatus = async (req, res) => {
  try {
    const { orderId, productId, status } = req.body;

    // Find the order with the given order ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Find the product in the order's products array with the given product ID
    const product = order.products.find((product) => product.product.toString() === productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found in the order' });
    }

    // Update the product's status
    product.status = status;

    // Save the updated order
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Unable to update status' });
  }
};






exports.getProductStockAndSoldCount = async (req, res) => {
  try {
    const sellerId = req.params. id;

    // Retrieve stock of each product added by the seller
    const productStock = await Product.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(sellerId),
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          stock: { $sum: '$stock' },
          thumbnail: { $first: '$thumbnail' },
          title: { $first: '$title' },
        },
      },
    ]);

    // Retrieve the count of sold products for the seller
    const soldCount = await Order.aggregate([
      {
        $match: {
          'products.seller': new mongoose.Types.ObjectId(sellerId),
          PaymentStatus: { $in: ['PAID', 'shipped', 'delivered'] },
        },
      },
      {
        $unwind: '$products',
      },
      {
        $match: {
          'products.seller': new mongoose.Types.ObjectId(sellerId),
        },
      },
      {
        $group: {
          _id: '$products.product',
          quantitySold: { $sum: '$products.quantity' },
        },
      },
    ]);

    // Combine the product stock and sold count data
    const productData = productStock.map((product) => {
      const soldProduct = soldCount.find((item) => item._id.equals(product._id));
      return {
        _id: product._id,
        // name: product.name,
        stock: product.stock,
        thumbnail: product.thumbnail,
        title: product.title,
        sold: soldProduct ? soldProduct.quantitySold : 0,
      };
    });

    res.json(productData);
  } catch (error) {
    console.error('Get product stock and sold count error:', error);
    res.status(500).json({ error: 'Unable to fetch product data' });
  }
};