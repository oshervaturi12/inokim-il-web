const mongoose = require('mongoose');

const trackerSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart'
    },
    pageUrl: String,
    referrer: String,
    device: String,
    browser: String,
    actions: [
      {
        type: {
          type: String,
          enum: [
            'page_view',
            'time_spent',
            'product_view',
            'add_to_cart',
            'checkout_start',
            'checkout_complete',
            'checkout_dropoff',
            'form_submit',
            'button_click',
            'video_play',
            'video_pause',
            'search',
            'filter_applied',
            'wishlist_add',
            'scroll_depth',
            'ab_test_action'
          ],
          required: true,
        },
        pageUrl: String, // ✅ Add page context to each action
        buttonId: String,
        buttonText: String,
        formId: String,
        formAction: String,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        searchQuery: String,
        timeSpent: Number, // For time_spent actions
        extraData: mongoose.Schema.Types.Mixed, // For flexible data
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },

  { timestamps: true }
);


module.exports = mongoose.model('Tracker', trackerSchema);


