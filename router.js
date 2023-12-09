const router = require('express').Router();
const path = require('path');
const mongoose = require('mongoose');
const productsSchema = require('./db/productsSchema');
const stylesSchema = require('./db/stylesSchema');

const products = mongoose.model('products', productsSchema);
const styles = mongoose.model('styles', stylesSchema);

router.get('/products', (req, res) => {

  const page = req.query.page || 1;
  const count = req.query.count || 5;

  products.find({}, {
    _id: 0,
    id: 1,
    name: 1,
    slogan: 1,
    description: 1,
    category: 1,
    default_price: 1,
  })
    .sort({ id: 1 })
    .skip((count * page) - count)
    .limit(count)
  .then((data) => {
    if (!data) {
      res.sendStatus(404);
    } else {
      res.send(data);
    }
  })
  .catch(() => {
    res.status(500).send('Error fetching products');
  })
})


router.get('/products/:id', (req, res) => {
  products.findOne({id: req.params.id}, {
    _id: 0,
    id: 1,
    name: 1,
    slogan: 1,
    description: 1,
    category: 1,
    default_price: 1,
    features: 1,
  })
  .then((data) => {
    if (!data) {
      res.sendStatus(404);
    } else {
      res.send(data);
    }
  })
  .catch(() => {
     res.status(500).send('Error fetching product ' + req.params.id);
  })
})


router.get('/products/:id/styles', (req, res) => {
  styles.find({product_id: req.params.id})
  .then((data) => {
    if (!data) {
      res.sendStatus(404);
    } else {
      res.send(data);
    }
  })
  .catch(() => {
    res.status(500).send('Error fetching styles for product ' + req.params.id);
  })
})


router.get('/products/:id/related', (req, res) => {
  products.findOne({id: req.params.id}, {
    _id: 0,
    related: 1,
  })
  .then((data) => {
    if (!data) {
      res.sendStatus(404);
    } else {
      res.send(data.related);
    }
  })
  .catch(() => {
    res.status(500).send('Error fetching related for product ' + req,params.id);
  })
})


module.exports = router;