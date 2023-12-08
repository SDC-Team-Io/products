const { parse } = require('csv-parse');
const mongoose = require('mongoose');
const productsSchema = require('./productsSchema');
const fs = require('fs');

const url = 'mongodb://localhost:27017/products'
const certificate = 'db/mongoose-certificate.pem';

const product = __dirname + '/csvs/product.csv';
const features = __dirname + '/csvs/features.csv';
const related = __dirname + '/csvs/related.csv';
const styles = __dirname + '/csvs/styles.csv';
const photos = __dirname + '/csvs/photos.csv';
const skus = __dirname + '/csvs/skus.csv';

const populateData = async (path, constructor, page) => {
  await mongoose.connect(url);

  const products = mongoose.model('products', productsSchema);

  console.log("Connected to MongoDB.");

  const readData = (path, constructor, page) => new Promise((resolve, reject) => {
    let doc = [];
    let length = doc.length;

    let chunk = [];

    console.log('Reading from '  + (page ? 'page ' + page + ' of ' : '') + 'file ' + path + '...');
    fs.createReadStream(path)
      .pipe(parse({
        delimiter: ",",
        from_line: page ? (page * 2000000) - 1999999 : 1 ,
        to_line: page ? (page * 2000000) : undefined
      }))
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
            if(!(i % 1000000)) console.log(path + (page ? ' page ' + page : ''));
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
          console.log('Finished writing ' + (page ? 'page ' + page + ' of ' : '') + path)
          resolve();
        })
        .catch(err => reject(err));
      })
  })
  if(path && constructor) readData(path, constructor)
  .then(() => {
    console.log('Done!')
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error(err);
    mongoose.connection.close();
  });


  if(!path || !constructor) readData(styles, stylesConstructor)
  .then((res) => {
    delete res;
    return readData(photos, photosConstructor, 1);
  })
  .then((res) => {
    delete res;
    return readData(photos, photosConstructor, 2);
  })
  .then((res) => {
    delete res;
    return readData(photos, photosConstructor, 3);
  })
  .then((res) => {
    delete res;
    return readData(product, productConstructor);
  })
  .then((res) => {
    delete res;
    return readData(features, featuresConstructor);
  })
  .then((res) => {
    delete res;
    return readData(related, relatedConstructor);
  })
  .then((res) => {
    delete res;
    return readData(skus, skusConstructor, 1);
  })
  .then((res) => {
    delete res;
    return readData(skus, skusConstructor, 2);
  })
  .then((res) => {
    delete res;
    return readData(skus, skusConstructor, 3);
  })
  .then((res) => {
    delete res;
    return readData(skus, skusConstructor, 4);
  })
  .then((res) => {
    delete res;
    return readData(skus, skusConstructor, 5);
  })
  .then((res) => {
    delete res;
    return readData(skus, skusConstructor, 6);
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
      $push: {
        features: {
          feature: data[2],
          value: data[3],
        }
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
        features: [],
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
  query.updateOne = {
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

module.exports.populateProducts = () => populateData(product, productConstructor);
module.exports.populateStyles = () => populateData(styles, stylesConstructor);
module.exports.populateFeatures = () => populateData(features, featuresConstructor);
module.exports.populatePhotos1 = () => populateData(photos, photosConstructor, 1);
module.exports.populatePhotos2 = () => populateData(photos, photosConstructor, 2);
module.exports.populatePhotos3 = () => populateData(photos, photosConstructor, 3);
module.exports.populateRelated = () => populateData(related, relatedConstructor);
module.exports.populateSkus1 = () => populateData(skus, skusConstructor, 1);
module.exports.populateSkus2 = () => populateData(skus, skusConstructor, 2);
module.exports.populateSkus3 = () => populateData(skus, skusConstructor, 3);
module.exports.populateSkus4 = () => populateData(skus, skusConstructor, 4);
module.exports.populateSkus5 = () => populateData(skus, skusConstructor, 5);
module.exports.populateSkus6 = () => populateData(skus, skusConstructor, 6);
module.exports.populateData = populateData;
