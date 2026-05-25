
const mongoose = require('mongoose');

const abTestSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true // e.g., "home.hero", "product.upsell"
  },
  description: String,
  variants: [
    {
      name: String, // e.g., "A", "B"
      weight: {
        type: Number,
        default: 50 // can be percentage-based
      },
      content: mongoose.Schema.Types.Mixed,
      impressions: {
        type: Number,
        default: 0
      },
      clicks: {
        type: Number,
        default: 0
      },
      conversions: { type: Number, default: 0 },
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  allowRepeat: {
    type: Boolean,
    default: false // whether to assign again per session or persist
  }
}, { timestamps: true });

module.exports = mongoose.model('ABTest', abTestSchema);
