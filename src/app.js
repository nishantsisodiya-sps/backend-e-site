require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const sellerRoutes = require('./routes/sellerRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes')
const supportRoutes = require('./routes/supportRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes')
const path = require('path');
const bodyParser = require('body-parser')
app.use(bodyParser.json())

// Middleware
app.use(cors());

// Routes
app.use('/sellers', sellerRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/order' , orderRoutes);
app.use('/support' , supportRoutes);
app.use('/category' , categoryRoutes)
app.use('/wishlist' , wishlistRoutes)


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB Atlas connection
mongoose.connect('mongodb+srv://nishantsisodiya:W9Ts90851N3QErRE@ecommcluster.ducmlqt.mongodb.net/?retryWrites=true&w=majority', {
})
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error(err);
  });


// Start the server
app.listen(process.env.PORT || 3838, () => {
  console.log('Server started on port 3838');
})
