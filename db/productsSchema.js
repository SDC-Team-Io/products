const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = new Schema({
  id: {type: Number, unique: true, required: true, index: true},
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: String,
  features: [{feature: String, value: String}],
  related: [Number]
})