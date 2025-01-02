const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Assuming you have a Product model
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productPrice: {
      type: Number,
      required: true
    },
    productImage: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', cartSchema);
