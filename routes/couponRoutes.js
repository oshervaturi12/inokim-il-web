
const express = require('express');
const couponController = require('./../controllers/couponController')
const router = express.Router();
const authController = require('./../controllers/authController')

router.use(authController.isLoggedIn)
router.use(authController.protect)

router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),couponController.getAllCoupons)
    .post(authController.protect, authController.restricTo('admin'),couponController.createCoupon)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),couponController.getCoupon)
    .patch(authController.protect, authController.restricTo('admin'),couponController.updateCoupon)
    .delete(authController.protect, authController.restricTo('admin'),couponController.deleteCoupon)

module.exports = router;