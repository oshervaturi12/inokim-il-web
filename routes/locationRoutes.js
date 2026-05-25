
const express = require('express');
const locationController = require('./../controllers/locationController')
const router = express.Router();
const authController = require('./../controllers/authController')



router
    .route('/')
    .get(locationController.getAllLocations)
    .post(authController.protect, authController.restricTo('admin'),locationController.createLocation)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),locationController.getLocation)
    .patch(authController.protect, authController.restricTo('admin'),locationController.updateLocation)
    .delete(authController.protect, authController.restricTo('admin'),locationController.deleteLocation)

module.exports = router;