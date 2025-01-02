const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    productPrice: {
        type: Number,
        required: true,
    },
    productDescription: {
        type: String,
        required: true,
        maxlength: 300,
    },
    productCategory: {
        type: String,
        required: true,
    },
    productImage: {
        type: String,
        required: true,
    },
    productRating: {
        type: Number,
        required: true,
    },
    productType: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Export the model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
