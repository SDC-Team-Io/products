const router = require('express').Router();
const path = require('path');
const mongoose = require('mongoose');
const Cache = require('cache');
const productsSchema = require('./db/productsSchema');
const stylesSchema = require('./db/stylesSchema');

const products = mongoose.model('products', productsSchema);
const styles = mongoose.model('styles', stylesSchema);

const productsCache = new Cache( 10 * 1000 );
const idCache = new Cache( 10 * 1000 );
const stylesCache = new Cache( 10 * 1000 );
const relatedCache = new Cache( 10 * 1000 );

router.get('/products', (req, res) => {

  const page = req.query.page || 1;
  const count = req.query.count || 5;
  const cacheString = page + ',' + count;
  const cached = productsCache.get(cacheString);

  if(cached !== null) {
    res.send(cached)
  } else {
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
        productsCache.put(cacheString, data);
        res.send(data);
      }
    })
    .catch(() => {
      res.status(500).send('Error fetching products');
    })
  }

})


router.get('/products/:id', (req, res) => {


  const cached = idCache.get(req.params.id);

  if(cached !== null) {
    res.send(cached);
  } else {
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
        idCache.put(req.params.id, data);
        res.send(data);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error fetching product ' + req.params.id);
    })
  }
})


router.get('/products/:id/styles', (req, res) => {

  const cached = stylesCache.get(req.params.id);

  if(cached !== null) {
    res.send(cached);
  } else {
    styles.find({product_id: req.params.id})
    .then((data) => {
      if (!data) {
        res.sendStatus(404);
      } else {
        stylesCache.put(req.params.id, data);
        res.send(data);
      }
    })
    .catch(() => {
      res.status(500).send('Error fetching styles for product ' + req.params.id);
    })
  }

})


router.get('/products/:id/related', (req, res) => {

  const cached = relatedCache.get(req.params.id);

  if(cached !== null) {
   res.send(cached);
  } else {
    products.findOne({id: req.params.id}, {
      _id: 0,
      related: 1,
    })
    .then((data) => {
      if (!data) {
        res.sendStatus(404);
      } else {
        relatedCache.put(req.params.id, data.related);
        res.send(data.related);
      }
    })
    .catch(() => {
      res.status(500).send('Error fetching related for product ' + req,params.id);
    })
  }

})


module.exports = router;