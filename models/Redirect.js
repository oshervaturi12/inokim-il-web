const mongoose = require('mongoose');

const redirectSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate redirects
    trim: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
  },
  isPermanent: {
    type: Boolean,
    default: true, // Default to 301 Permanent Redirect
  },
}, { timestamps: true });

module.exports = mongoose.model('Redirect', redirectSchema);
