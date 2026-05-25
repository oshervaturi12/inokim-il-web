const mongoose = require('mongoose');
const { Schema } = mongoose;

const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    // Coupon type
    type: {
      type: String,
      enum: ['buy_x_get_y', 'free_shipping', 'percentage', 'fixed', 'category_discount'],
      required: [true, 'Coupon type is required'],
    },

    // Percentage discount (for 'percentage' type)
    discountValue: {
      type: Number,
      min: [0, 'Discount value cannot be negative'],
      max: [100, 'Percentage discount cannot exceed 100'],
    },

    // Fixed price discount (for 'fixed' type)
    fixedPrice: {
      type: Number,
      min: [0, 'Fixed price cannot be negative'],
    },

    // Buy X Get Y (for 'buy_x_get_y' type)
    buyXGetY: {
      buyQuantity: { type: Number, min: 1 },
      getQuantity: { type: Number, min: 1 },
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    },

    // Free shipping (for 'free_shipping' type)
    freeShipping: {
      type: Boolean,
      default: false,
    },

    // Category discount (for 'category_discount' type)
    categoryDiscount: {
      categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
      percent: {
        type: Number,
        min: [0, 'Category discount cannot be negative'],
        max: [100, 'Category discount cannot exceed 100'],
      },
    },

    // Minimum cart total required to apply the coupon
    minimumPurchase: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase cannot be negative'],
    },

    // Expiration date
    expirationDate: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },

    // Usage limits
    usageLimit: {
      type: Number, // Max total uses
      default: null,
      min: [1, 'Usage limit must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number, // Max uses per user
      default: null,
      min: [1, 'Per-user limit must be at least 1'],
    },

    // Can be combined with other coupons
    combinable: {
      type: Boolean,
      default: false,
    },

    applicableProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],

    // Coupon status
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save validation to enforce logic based on coupon type
CouponSchema.pre('save', function (next) {
  if (this.type === 'percentage' && (!this.discountValue || this.discountValue > 100)) {
    return next(new Error('Percentage discount must be between 0 and 100'));
  }
  if (this.type === 'fixed' && !this.fixedPrice) {
    return next(new Error('Fixed price is required for fixed price coupons'));
  }
  if (this.type === 'buy_x_get_y') {
    if (!this.buyXGetY || !this.buyXGetY.buyQuantity || !this.buyXGetY.getQuantity) {
      return next(new Error('Buy X Get Y requires buyQuantity and getQuantity'));
    }
  }
  if (this.type === 'category_discount') {
    if (!this.categoryDiscount || !this.categoryDiscount.categoryId || !this.categoryDiscount.percent) {
      return next(new Error('Category discount requires categoryId and percent'));
    }
  }
  next();
});

// Static method to check coupon validity
CouponSchema.statics.isValid = async function (code) {
  const coupon = await this.findOne({
    code,
    active: true,
    expirationDate: { $gte: new Date() },
  });
  return coupon || null;
};

module.exports = mongoose.model('Coupon', CouponSchema);
