const fs = require('fs');
const path = require('path');
const dirname = require('../util/path');

const filePath = path.join(dirname, 'data', 'products.json');

const getProductsFromFile = callback => {
  fs.readFile(filePath, (err, fileContent) => {
    if (err) {
      return callback([]);
    }
    return callback(JSON.parse(fileContent));
  });
}

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(filePath, JSON.stringify(products), err => {
        if (err) {
          console.log(err);
        }
      });
    });
  }

  static fetchAll(callback) {
    getProductsFromFile(callback);
  }
}