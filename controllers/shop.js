const { redirect } = require('express/lib/response');
const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findByPk(productId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(cart => cart.getProducts()
      .then(products => {
        res.render('shop/cart', {
          pageTitle: 'Your Cart',
          path: '/cart',
          products: products
        });
      })
      .catch(err => console.log(err)))
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId } })
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(productId);
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
    })
    .then(() => res.redirect('/cart'))
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: productId } });
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let products;
  req.user.getCart()
    .then(cart => cart.getProducts())
    .then(cartProducts => {
      products = cartProducts;
      return req.user.createOrder()
    })
    .then(order => order.addProducts(products
      .map(product => {
        product.orderItem = { quantity: product.cartItem.quantity }
        return product;
      })))
    .then(() => res.redirect('/orders'))
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  });
}