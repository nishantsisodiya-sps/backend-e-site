const mongoose = require('mongoose');
const validator = require('validator')
const { isAlpha } = require('validator');

const superAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: (value) => validator.isAlpha(value),
      message: 'Name should only contain letters'
    }
  },


  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email address'
    }
  },


  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    default: 'superAdmin'
  }
});

module.exports = mongoose.model('SuperAdmin', superAdminSchema);
