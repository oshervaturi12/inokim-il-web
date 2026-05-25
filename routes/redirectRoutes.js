
const express = require('express');
const redirectController = require('./../controllers/redirectController')
const router = express.Router();
const authController = require('./../controllers/authController')



router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),redirectController.getAllRedirects)
    .post(authController.protect, authController.restricTo('admin'),redirectController.createRedirect)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),redirectController.getRedirect)
    .patch(authController.protect, authController.restricTo('admin'),redirectController.updateRedirect)
    .delete(authController.protect, authController.restricTo('admin'),redirectController.deleteRedirect)

module.exports = router;