const factory = require('./handlerFactory')
const Coupon = require('./../models/Coupon')

exports.getAllCoupons = factory.getAll(Coupon)

exports.createCoupon = factory.createOne(Coupon)

exports.getCoupon = factory.getOne(Coupon)

exports.updateCoupon = factory.updateOne(Coupon)

exports.deleteCoupon = factory.deleteOne(Coupon)