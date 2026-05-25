const factory = require('./handlerFactory')
const Seo = require('./../models/Seo')

exports.getAllSeos = factory.getAll(Seo)

exports.createSeo = factory.createOne(Seo)

exports.getSeo = factory.getOne(Seo)

exports.updateSeo = factory.updateOne(Seo)

exports.deleteSeo = factory.deleteOne(Seo)