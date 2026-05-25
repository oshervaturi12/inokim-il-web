const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  prdName: {
    type: String
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Product', 
    required: true
  },
  color: {
    name: String,
    hex: String
  },
  suspensions: String,
  sku: String,
  quantity: {
    type: Number,
    default: 1
  },
  img: {
    type: String
  },
  price: Number,
  originalPrice: Number,
  compareAtPrice: Number,
  availability: {
    type: String
  }
});

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null // If null, it means the cart belongs to a guest session
  },
  sessionId: {
    type: String,
    // required: true
    required: function () { return !this.userId; } 
  },
  items: [cartItemSchema],
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null
  },
  discount: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  isNoVAT: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['open', 'completed', 'cancelled'],
    default: 'open'
  }
}, { timestamps: true });

// cartSchema.pre('save', async function (next) {
//   let total = 0;

//   // Sum up all items' prices
//   this.items.forEach((item) => {
//     total += (item.price || 0) * item.quantity;
//   });

//   // Apply coupon if exists
//   if (this.coupon) {
//     const Coupon = mongoose.model('Coupon');
//     const coupon = await Coupon.findById(this.coupon);

//     if (coupon && coupon.active && coupon.expirationDate >= new Date()) {
//       if (total >= coupon.minimumPurchase) {
//         if (coupon.discountType === 'percentage') {
//           this.discount = (coupon.discountValue / 100) * total;
//         } else if (coupon.discountType === 'fixed') {
//           this.discount = Math.min(coupon.discountValue, total);
//         }
//       } else {
//         this.discount = 0; // Minimum purchase not met
//       }
//     }
//   }

//   // Final total price after discount
//   this.totalPrice = total - this.discount;
//   next();
// });

cartSchema.pre('save', async function (next) {
  let total = 0;

  // Sum up all items' prices
  this.items.forEach((item) => {
    total += (item.price || 0) * item.quantity;
  });

  let coupon = this.coupon;

  if (coupon) {
    // If coupon is populated (object), skip the findById
    if (typeof coupon === 'object' && coupon._id) {
      // already populated
    } else {
      const Coupon = mongoose.model('Coupon');
      coupon = await Coupon.findById(this.coupon);
    }

    if (coupon && coupon.active && coupon.expirationDate >= new Date()) {
      if (total >= coupon.minimumPurchase) {
        if (coupon.type === 'percentage') {
          this.discount = (coupon.discountValue / 100) * total;
        } else if (coupon.type === 'fixed') {
          this.discount = Math.min(coupon.fixedPrice || 0, total);
        }
      } else {
        this.discount = 0; // Minimum purchase not met
      }
    }
  }

  // Final total price after discount
  this.totalPrice = total - this.discount;
  next();
});



module.exports = mongoose.model('Cart', cartSchema);
