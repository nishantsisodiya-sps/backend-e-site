const mongoose = require('mongoose');
const validator = require('validator')


const addressSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    addressLine1: {
        type: String,
        required: true
    },
    addressLine2: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true,
        validate: {
            validator: (value) => {
                return validator.isPostalCode(value, 'any'); // Validate postal code using validator
            },
            message: 'Invalid postal code'
        }
    },
    country: {
        type: String,
        required: true
    },
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
    isDefault: {
        type: Boolean,
        default: false,
    },
});



const Address = mongoose.model('Address', addressSchema)

module.exports = Address