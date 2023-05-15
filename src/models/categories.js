const mongoose = require('mongoose');

const ProductCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },

},
);

module.exports = mongoose.model('ProductCategory', ProductCategorySchema);