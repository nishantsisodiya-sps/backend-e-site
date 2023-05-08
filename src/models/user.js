const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true , lowercase: true },
  password: { type: String, required: true },
  phone: { type: Number, required: true },
  role: { type: String, enum: ['user', 'seller', 'superAdmin'], default: 'user' },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tokens: [{
    token: { type: String, required: true }
  }]
});

userSchema.pre('save', async function (next) {
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


userSchema.methods.generateAuthToken =async function () {
  try {
    const token = jwt.sign({ id: this._id, role: this.role , email : this.email , name : this.name }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })
    this.tokens = this.tokens.concat({ token })
    await this.save()
    return token;
  } catch (error) {
    console.log(error);
  }
}

module.exports = mongoose.model('User', userSchema);
