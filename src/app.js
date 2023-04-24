const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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
mongoose.connect(process.env.MONGODB_URL, {
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
