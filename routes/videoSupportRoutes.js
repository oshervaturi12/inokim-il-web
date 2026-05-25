
const express = require('express');
const videoSupport = require('./../controllers/videoSupportController')
const router = express.Router();
const authController = require('./../controllers/authController')



router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),videoSupport.getAllVideoSupports)
    .post(authController.protect, authController.restricTo('admin'),videoSupport.createVideoSupport)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),videoSupport.getVideoSupport)
    .patch(authController.protect, authController.restricTo('admin'),videoSupport.updateVideoSupport)
    .delete(authController.protect, authController.restricTo('admin'),videoSupport.deleteVideoSupport)

module.exports = router;