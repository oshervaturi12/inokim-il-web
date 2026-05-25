const factory = require('./handlerFactory')
const Redirect = require('./../models/Redirect')

exports.getAllRedirects = factory.getAll(Redirect)

exports.createRedirect = factory.createOne(Redirect)

exports.getRedirect = factory.getOne(Redirect)

exports.updateRedirect = factory.updateOne(Redirect)

exports.deleteRedirect = factory.deleteOne(Redirect)