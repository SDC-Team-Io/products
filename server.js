const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = require('./router');

const app = express();
const port = 3000;

const url = 'mongodb://localhost:27017/products'
const certificate = path.join(__dirname, '/db/mongoose-certificate.pem');



app.use('/', router);
app.use(express.json());
app.use(express.static(path.join(__dirname, './public/dist')));

mongoose.connect(url)
.then(() => {
  app.listen(port, () => {
    console.log('Products Server Live on Port ' + port);
  })
})
