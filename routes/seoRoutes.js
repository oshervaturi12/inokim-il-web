
const express = require('express');
const seoController = require('./../controllers/seoController')
const router = express.Router();
const authController = require('./../controllers/authController')



router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),seoController.getAllSeos)
    .post(authController.protect, authController.restricTo('admin'),seoController.createSeo)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),seoController.getSeo)
    .patch(authController.protect, authController.restricTo('admin'),seoController.updateSeo)
    .delete(authController.protect, authController.restricTo('admin'),seoController.deleteSeo)

module.exports = router;