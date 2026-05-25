
const express = require('express');
const pageController = require('./../controllers/pageController')
const router = express.Router();
const authController = require('./../controllers/authController')

router.post('/upload', pageController.uploadInquiryImages);

router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),pageController.getAllPages)
    .post(authController.protect, authController.restricTo('admin'),pageController.createPage)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),pageController.getPage)
    .patch(authController.protect, authController.restricTo('admin'),pageController.updatePage)
    .delete(authController.protect, authController.restricTo('admin'),pageController.deletePage)

module.exports = router;