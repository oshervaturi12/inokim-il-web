const factory = require('./handlerFactory')
const VideoSupport = require('./../models/VideoSupport')

exports.getAllVideoSupports = factory.getAll(VideoSupport)

exports.createVideoSupport = factory.createOne(VideoSupport)

exports.getVideoSupport = factory.getOne(VideoSupport)

exports.updateVideoSupport = factory.updateOne(VideoSupport)

exports.deleteVideoSupport = factory.deleteOne(VideoSupport)