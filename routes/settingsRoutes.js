
const express = require('express');
const settingController = require('./../controllers/settingsController')
const router = express.Router();
const authController = require('./../controllers/authController')



router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),settingController.getAllSettings)
    .post(authController.protect, authController.restricTo('admin'),settingController.createSettings)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),settingController.getSettings)
    .patch(authController.protect, authController.restricTo('admin'),settingController.updateSettings)
    .delete(authController.protect, authController.restricTo('admin'),settingController.deleteSettings)

module.exports = router;