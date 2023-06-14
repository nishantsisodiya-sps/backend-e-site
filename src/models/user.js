const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator')
const { isAlpha } = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: (name) => isAlpha(name),
      message: 'Name should only contain alphabetic characters'
    }
  },

  email: {
    type: String, required: true, unique: true, lowercase: true, validate: {
      validator: validator.isEmail,
      message: 'Invalid email address'
    }
  },

  password: { type: String, required: true },

  
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return validator.isMobilePhone(v, ['en-IN']);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },

  role: { type: String, enum: ['user', 'seller', 'superAdmin'], default: 'user' },

  createdAt: {
    type: Date,
    default: Date.now
  },

  isBlocked : {
    type : Boolean,
    enum: [true , false],
    default:false
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


userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ id: this._id, role: this.role, email: this.email, name: this.name }, process.env.JWT_SECRET, {
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
