const mongoose = require('mongoose');

const subLinkSchema = new mongoose.Schema({
  title: String,
  path: String
});

const navItemSchema = new mongoose.Schema({
  title: String,
  path: { type: String, default: null }, // If dropdown, path can be null
  children: [subLinkSchema],
  order: Number,
  showInMobile: { type: Boolean, default: true },
  showInDesktop: { type: Boolean, default: true }
});

module.exports = mongoose.model('Navigation', navItemSchema);
