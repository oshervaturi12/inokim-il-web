const factory = require('./handlerFactory')
const HomaPage = require('./../models/HomePage')

exports.getAllHomaPages = factory.getAll(HomaPage)

exports.createHomaPage = factory.createOne(HomaPage)

exports.getHomaPage = factory.getOne(HomaPage)

exports.updateHomaPage= factory.updateOne(HomaPage)

exports.deleteHomaPage = factory.deleteOne(HomaPage)