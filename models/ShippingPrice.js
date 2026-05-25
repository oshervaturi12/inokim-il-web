const mongoose = require('mongoose');

const shippingPriceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fixed', 'conditional', 'category_based'],
    required: true
  },

  // Fixed price (applies to all orders)
  fixedPrice: {
    type: Number,
    min: 0
  },

  // Conditional free shipping (based on minimum order total)
  conditional: {
    minimumOrderAmount: {
      type: Number,
      min: 0
    },
    priceIfNotMet: {
      type: Number,
      min: 0
    }
  },

  // Shipping by categories
  categoryPrices: [
    {
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
      },
      price: {
        type: Number,
        min: 0
      }
    }
  ],

  active: {
    type: Boolean,
    default: true
  },

  name: {
    type: String,
    required: true
  },

  description: String
}, { timestamps: true });

module.exports = mongoose.model('ShippingPrice', shippingPriceSchema);
