
const express = require('express');
const cartController = require('./../controllers/cartController')
const router = express.Router();
const authController = require('./../controllers/authController')


router.post('/apply-coupon', cartController.applyCoupon);
router.get('/mini-cart', cartController.getMiniCart)
router.get('/count', cartController.getCartCount)
router.delete('/item/:id', cartController.removeItemFromCart)

router.post('/update-prices', cartController.updateCartPrices)
router.get('/update-vat', cartController.updateCartForVat)


router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'), cartController.getAllCarts)
    .post( cartController.addToCart)
router
    .route('/:id')
    .get(cartController.getCart)
    .patch(cartController.updateCart)
    .delete(cartController.deleteCart)

module.exports = router;