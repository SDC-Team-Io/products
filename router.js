const router = require('express').Router();
const path = require('path');
const mongoose = require('mongoose');
const productsSchema = require('./db/productsSchema')

const products = mongoose.model('products', productsSchema);

router.get('/products/:id', (req, res) => {
  console.log('Serving GET at endpoint /products for ip ' + req.ip);
  products.findOne({product_id: req.params.id}, {
    product_id: 1,
    name: 1,
    slogan: 1,
    description: 1,
    category: 1,
    default_price: 1,
    features: 1,
  })
  .then((data) => {
    data.id = data.product_id;
    res.send(data);
  })
})

module.exports = router;