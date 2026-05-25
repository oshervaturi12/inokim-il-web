const factory = require('./handlerFactory')
const Footer = require('./../models/FooterSectionSchema')


exports.createFooter = factory.createOne(Footer)

exports.getFooter = factory.getOne(Footer)

exports.updateFooter = factory.updateOne(Footer)

exports.deleteFooter = factory.deleteOne(Footer)