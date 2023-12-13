const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = require('./router');
require('dotenv').config();

const app = express();
const port = 3000;

const url = process.env.MONGO_URL;
const certificate = path.join(__dirname, '/db/mongoose-certificate.pem');

console.log(url);

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
.catch((err) => {
  console.error('Error connecting to Mongo Database: ' + err)
})
