const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true , lowercase: true},
  password: { type: String, required: true },
  phone: { type: String, required: true },

  role: { type: String, enum: ['seller'], default: 'seller' },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tokens: [{
    token: { type: String, required: true }
  }]
});

sellerSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    }
    next();
  } catch (err) {
    next(err);
  }
});


sellerSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    this.tokens = this.tokens.concat({token});
     await this.save();
    return token; 
  } catch (error) {
    console.log(error);
  }
  
};

module.exports = mongoose.model('Seller', sellerSchema);
