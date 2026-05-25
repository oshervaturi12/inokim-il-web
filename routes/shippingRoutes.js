
const express = require('express');
const shippingController = require('./../controllers/shippingController')
const router = express.Router();
const authController = require('./../controllers/authController')



router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),shippingController.getAllShippings)
    .post(authController.protect, authController.restricTo('admin'),shippingController.createShipping)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),shippingController.getShipping)
    .patch(authController.protect, authController.restricTo('admin'),shippingController.updateShipping)
    .delete(authController.protect, authController.restricTo('admin'),shippingController.deleteShipping)

module.exports = router;