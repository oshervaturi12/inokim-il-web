const mongoose = require('mongoose');
const Product = require('./Products')

const upsellSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customTitle: String,
  customDescription: String,
  customSvg: {
    type: String
  },
  customPrice: {
    type: Number,
    min: 0
  },
  customImage: String,
  customVideo: String,
  isActive: {
    type: Boolean,
    default: true
  },
  categoryUpsell: {
    type: Number,
    default: 1
  }
}, { timestamps: true });


upsellSchema.post('save', async function (doc, next) {
    try {
      if (doc.product) {
        await Product.findByIdAndUpdate(
          doc.product,
          { $addToSet: { upsell: doc._id } }, // ✅ Prevent duplicates
          { new: true }
        );
        console.log(`✅ Upsell ${doc._id} added to product ${doc.product}`);
      }
      next();
    } catch (error) {
      console.error('❌ Error updating product with upsell:', error);
      next(error);
    }
  });

module.exports = mongoose.model('Upsell', upsellSchema);
