const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  thumbnail: {
    type: String
  }
}, { _id: false });

const videoSupportSchema = new mongoose.Schema({
  modelName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    index: true
  },
  modelLogoSvg: {
    type: String
  },
  modelImg: {
    type: String
  },
  videos: [videoSchema],
}, { timestamps: true });

module.exports = mongoose.model('VideoSupport', videoSupportSchema);
