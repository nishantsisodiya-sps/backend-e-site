const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true , lowercase: true },
  password: { type: String, required: true },
  phone: { type: Number, required: true },
  role: { type: String, enum: ['user', 'seller', 'superAdmin'], default: 'user' },
  tokens: [{
    token: { type: String, required: true }
  }]
});

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

userSchema.methods.generateAuthToken =async function () {
  try {
    const token = jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })
    this.tokens = this.tokens.concat({ token })
    await this.save()
    return token;
  } catch (error) {
    console.log(error);
  }
}

module.exports = mongoose.model('User', userSchema);
