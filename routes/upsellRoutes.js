
const express = require('express');
const upsellController = require('./../controllers/upsellController')
const router = express.Router();
const authController = require('./../controllers/authController')



router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),upsellController.getAllUpsells)
    .post(authController.protect, authController.restricTo('admin'),upsellController.createUpsell)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),upsellController.getUpsell)
    .patch(authController.protect, authController.restricTo('admin'),upsellController.updateUpsell)
    .delete(authController.protect, authController.restricTo('admin'),upsellController.deleteUpsell)

module.exports = router;