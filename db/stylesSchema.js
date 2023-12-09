const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = new Schema({
  product_id: {type: Number, index: true},
  style_id: {type: Number, index: true},
  name: String,
  original_price: String,
  sale_price: String,
  'default?': Boolean,
  photos: [{thumbnail_url: String, url: String}],
  skus: [{
    sku: String,
    quantity: String,
    size: String
  }]
})