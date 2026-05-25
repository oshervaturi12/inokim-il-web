const factory = require('./handlerFactory')
const Settings = require('./../models/Settings')

exports.getAllSettings = factory.getAll(Settings)

exports.createSettings = factory.createOne(Settings)

exports.getSettings = factory.getOne(Settings)

exports.updateSettings = factory.updateOne(Settings)

exports.deleteSettings = factory.deleteOne(Settings)