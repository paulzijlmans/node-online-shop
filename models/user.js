const mongoose = require('mongoose');
const product = require('./product');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: product,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }]
  }
});

module.exports = mongoose.model('User', userSchema);