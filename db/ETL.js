const { parse } = require('csv-parse');
const mongoose = require('mongoose');
const productsSchema = require('./productsSchema');
const fs = require('fs');

const url = 'mongodb://localhost:27017/test'
const certificate = 'db/mongoose-certificate.pem';

const product = __dirname + '/csvs/product.csv';
const features = __dirname + '/csvs/features.csv';
const related = __dirname + '/csvs/related.csv';
const styles = __dirname + '/csvs/styles.csv';
const photos = __dirname + '/csvs/photos.csv';
const skus = __dirname + '/csvs/skus.csv';

const populateData = async () => {
  await mongoose.connect(url)

  const products = mongoose.model('products', productsSchema);

  console.log("Connected to MongoDB.");

  const readData = (path, constructor) => new Promise((resolve, reject) => {
    let doc = [];
    let length = doc.length;

    let chunk = [];

    console.log('Reading from file ' + path + '...');
    fs.createReadStream(path)
      .pipe(parse({ delimiter: ",", from_line: 1 }))
      .on("data", function (row) {
        let writeItem = constructor(row);
        if(writeItem) {
          doc.push(writeItem);
        }
      })
      .on("error", function (err) {
        reject(err);
      })
      .on("end", function () {
        console.log('Writing...');
        let count = 0;
        const writeDocs = () => new Promise((resolve, reject) => {
          console.log('-');
          let i = count * 10000;
          let chunk = doc.slice(i, i + 10000);
          console.log('Writing lines ' + i + ' to ' + (i + chunk.length - 1) + '.');
          products.bulkWrite(chunk)
          .then((res) => {
            delete res;
            delete chunk;
            console.log('Lines ' + i + ' to ' + (i + chunk.length - 1) + ' done.');
            if(i < doc.length) {
              count++;
              writeDocs()
              .then(() => {
                resolve();
              })
              .catch((err) => {
                console.error(err);
              })
            } else {
              resolve();
            }
          })
          .catch((err) => {
            reject(err);
          })
        })
        writeDocs()
        .then(() => {
          console.log('Finished writing ' + path)
          resolve();
        })
        .catch(err => reject(err));
      })
  })

  module.exports.populateProducts = () => readData(product, productConstructor);
  module.exports.populateStyles = () => readData(styles, stylesConstructor);
  module.exports.populateFeatures = () => readData(features, featuresConstructor);
  module.exports.populatePhotos = () => readData(photos, photosConstructor);
  module.exports.populateRelated = () => readData(related, relatedConstructor);
  module.exports.populateSkus = () => readData(skus, skusConstructor);

  module.exports.populateStyles()
  .then((res) => {
    delete res;
    return module.exports.populatePhotos();
  })
  .then((res) => {
    delete res;
    return module.exports.populateProducts();
  })
  .then((res) => {
    delete res;
    return module.exports.populateFeatures();
  })
  .then((res) => {
    delete res;
    return module.exports.populateRelated();
  })
  .then((res) => {
    delete res;
    return module.exports.populateSkus();
  })
  .then(() => {
    console.log('Done!')
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error(err);
    mongoose.connection.close();
  })

};

const productConstructor = (data) => {
  let query = {};
  query.updateOne = {
    filter: { product_id: data[0] },
    update: {
      product_id: data[0] * 1,
      name: data[1],
      slogan: data[2],
      description: data[3],
      category: data[4],
      default_price: data[5],
    },
    upsert: true,
  }
    data[0] = Number(data[0])
    if(!data[0]) return;
  return query;
}

const featuresConstructor = (data) => {
  data[1] = Number(data[1])
  if(!data[1]) return;
  let query = {};
  query.updateOne = {
    filter: { product_id: data[1] },
    update: {
      features: {
        feature: data[2],
        value: data[3],
      }
    }
  }
  return query;
}

const stylesConstructor = (data) => {
  data[1] = Number(data[1])
  if(!data[1]) return;
  let query = {};
  query.updateOne = {
    filter: { product_id: data[1] },
    update: {
      product_id: data[1],
      $push: {
        styles: {
          style_id: data[0],
          name: data[2],
          original_price: data[4],
          sale_price: data[3],
          default_style: data[5],
        }
      }
    },
    upsert: true,
  }
  return query;
}

const skusConstructor = (data) => {
  data[1] = Number(data[1])
  if(!data[1]) return;
  let query = {};
  query.insertOne = {
    filter: { 'styles.style_id': { $eq: data[1] } },
    update: {
      $push: {
        'styles.$[i].skus': {
          sku: data[0],
          quantity: data[3],
          size: data[2],
        }
      }
    },
    arrayFilters: [{ 'i.style_id': data[1] }]
  }
  return query;
}

const photosConstructor = (data) => {
  data[1] = Number(data[1])
  if(!data[1]) return;
  let query = {};
  query.updateOne = {
    filter: { 'styles.style_id': { $eq: data[1] } },
    update: {
      $push: {
        'styles.$[i].photos': {
          thumbnail_url: data[3] || undefined,
          url: data[2],
        }
      }
    },
    arrayFilters: [{ 'i.style_id': data[1] }]
  }
  return query;
}

const relatedConstructor = (data) => {
  data[1] = Number(data[1])
  if(!data[1]) return;
  let query = {};
  query.updateOne = {
    filter: { product_id: data[1] },
    update: {
      $push: {
        related: data[2]
      }
    }
  }
  return query;
}


populateData();
