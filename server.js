const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = require('./router');

const app = express();
const port = 3000;

const url = 'mongodb://localhost:27017/products'
const certificate = path.join(__dirname, '/db/mongoose-certificate.pem');


app.use(morgan('tiny'));
app.use('/', router);
app.use(express.json());
app.use(express.static(path.join(__dirname, './public/dist')));

console.log('Connecting to MongoDB...');

mongoose.connect(url)
.then(() => {
  console.log('Connected!');
  app.listen(port, () => {
    console.log('Products Server Live on Port ' + port);
  })
})
.catch(() => {
  console.error('Error connecting to Mongo Database')
})
