const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = new Schema({
  product_id: {type: Number, unique: true, required: true, index: true},
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: String,
  features: [{feature: String, value: String}],
  styles: [{
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
  }],
  related: [Number]
})