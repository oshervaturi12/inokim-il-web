const mongoose = require('mongoose');

const footerLinkSchema = new mongoose.Schema({
  title: String,
  path: String
});

const footerSectionSchema = new mongoose.Schema({
  label: String,
  links: [footerLinkSchema],
  order: Number
});

const footerSchema = new mongoose.Schema({
  disclaimer: String,
  sections: [footerSectionSchema],
  legal: {
    copyright: String,
    links: [footerLinkSchema]
  }
});

module.exports = mongoose.model('Footer', footerSchema);