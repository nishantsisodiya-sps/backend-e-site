require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const sellerRoutes = require('./routes/sellerRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/sellers', sellerRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);

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
app.listen(process.env.PORT || 2800, () => {
  console.log('Server started on port 2800');
});
