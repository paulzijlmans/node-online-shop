const fs = require('fs');
const path = require('path');
const dirname = require('../util/path');

const filePath = path.join(dirname, 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(filePath, (err, previousCart) => {
      let cart = { products: [], totalPrice: 0 }
      if (!err) {
        cart = JSON.parse(previousCart);
      }

      const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.quantity = updatedProduct.quantity + 1;
        cart.products = [...cart.products]
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, quantity: 1 }
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(filePath, JSON.stringify(cart), error => {
        console.log(error);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(filePath, (err, cart) => {
      if (err) {
        return;
      }
      const updatedCart = { ...JSON.parse(cart) };
      const productToDelete = updatedCart.products.find(product => product.id === id);
      if (productToDelete) {
        const productQuantity = productToDelete.quantity;
        updatedCart.products = updatedCart.products.filter(product => product.id !== id);
        updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQuantity;

        fs.writeFile(filePath, JSON.stringify(updatedCart), error => {
          console.log(error);
        });
      }
    });
  }

  static getCart(callback) {
    fs.readFile(filePath, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) {
        callback(null);
      } else {
        callback(cart);
      }
    });
  }
}