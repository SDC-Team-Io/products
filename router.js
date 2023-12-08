const router = require('express').Router();
const path = require('path');
const mongoose = require('mongoose');
const productsSchema = require('./db/productsSchema')

const products = mongoose.model('products', productsSchema);

router.get('/products/:id', (req, res) => {

  products.findOne({product_id: req.params.id}, {
    _id: 0,
    product_id: 1,
    name: 1,
    slogan: 1,
    description: 1,
    category: 1,
    default_price: 1,
    features: 1,
  })
  .then((data) => {
    if (!data) res.send(404);
    data.id = data.product_id;
    res.send(data);
  })
  .catch(() => {
     res.status(500).send('Error fetching product ' + req.params.id);
  })
})

module.exports = router;