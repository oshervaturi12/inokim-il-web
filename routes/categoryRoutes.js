
const express = require('express');
const categoryController = require('./../controllers/categoryController')
const router = express.Router();
const authController = require('./../controllers/authController')



router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),categoryController.getAllCategories)
    .post(authController.protect, authController.restricTo('admin'),categoryController.createCategory)
router
    .route('/:id')
    .get(categoryController.getCategory)
    .patch(authController.protect, authController.restricTo('admin'),categoryController.updateCategory)
    .delete(authController.protect, authController.restricTo('admin'),categoryController.deleteCategory)

module.exports = router;