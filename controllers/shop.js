const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (_req, res, _next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, _next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (_req, res, _next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, _next) => {
  req.user.populate('cart.items.productId')
    .then(user => {
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: user.cart.items,
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, _next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then(product => req.user.addToCart(product))
    .then(() => res.redirect('/cart'));
};

exports.postCartDeleteProduct = (req, res, _next) => {
  const productId = req.body.productId;
  req.user.deleteFromCart(productId)
    .then(() => res.redirect('/cart'))
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, _next) => {
  req.user.populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(item => {
        return {
          quantity: item.quantity,
          product: { ...item.productId._doc }
        };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(() => req.user.clearCart())
    .then(() => res.redirect('/orders'))
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, _next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders: orders,
      });
    })
    .catch(err => console.log(err));
};