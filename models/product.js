const fs = require('fs');
const path = require('path');
const dirname = require('../util/path');

const Cart = require('./cart');

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
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(product => product.id === this.id);
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        this.writeProductsToFile(updatedProducts);
      } else {
        this.id = Math.random().toString();
        products.push(this);
        this.writeProductsToFile(products);
      }
    });
  }

  writeProductsToFile(products) {
    fs.writeFile(filePath, JSON.stringify(products), err => {
      if (err) {
        console.log(err);
      }
    });
  }

  static fetchAll(callback) {
    getProductsFromFile(callback);
  }

  static findById(id, callback) {
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id);
      callback(product);
    })
  }

  static deleteById(id) {
    getProductsFromFile(products => {
      const productToDelete = products.find(product => product.id === id);
      const updatedProducts = products.filter(product => product.id !== id);
      fs.writeFile(filePath, JSON.stringify(updatedProducts), err => {
        if (!err) {
          Cart.deleteProduct(id, productToDelete.price);
        }
      });
    });
  }
}