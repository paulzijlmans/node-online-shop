const express = require('express');

const productsController = require('../controllers/products');

const router = express.Router();

router.get('/', productsController.getShop);

router.get('/products', productsController.getShopProducts);

router.get('/cart', productsController.getCart);

module.exports = router;