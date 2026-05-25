const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
     seo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seo',
      }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Category', categorySchema);
