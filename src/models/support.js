const mongoose = require('mongoose')


const contactUs = new mongoose.Schema({

    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Seller'
    },
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        // unique : true
    } ,
    message : {
        type : String ,
        required : true
    }

})

module.exports = mongoose.model('contactUs' , contactUs)