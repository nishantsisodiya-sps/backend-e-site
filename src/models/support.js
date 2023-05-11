const mongoose = require('mongoose')
const validator = require('validator')
const { isAlpha } = require('validator');

const contactUs = new mongoose.Schema({

    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: function () {
            return !this.sellerId;
        }
    },
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Seller',
        required: function () {
            return !this.userId;
        }
    },
    name: {
        type: String,
        required: true,
        validate: {
          validator: (name) => isAlpha(name),
          message: 'Name should only contain alphabetic characters'
        }
      },
    email : {
        type : String,
        required : true,
        validate: {
            validator: validator.isEmail,
            message: 'Invalid email address'
          }
    } ,
    message : {
        type : String ,
        required : true
    }

});

module.exports = mongoose.model('contactUs' , contactUs)