const factory = require('./handlerFactory')
const Upsell = require('./../models/Upsell')

exports.getAllUpsells = factory.getAll(Upsell)

exports.createUpsell = factory.createOne(Upsell)

exports.getUpsell = factory.getOne(Upsell)

exports.updateUpsell = factory.updateOne(Upsell)

exports.deleteUpsell = factory.deleteOne(Upsell)