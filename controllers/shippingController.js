const factory = require('./handlerFactory')
const Shipping = require('./../models/ShippingPrice')

exports.getAllShippings = factory.getAll(Shipping)

exports.createShipping = factory.createOne(Shipping)

exports.getShipping = factory.getOne(Shipping)

exports.updateShipping = factory.updateOne(Shipping)

exports.deleteShipping = factory.deleteOne(Shipping)