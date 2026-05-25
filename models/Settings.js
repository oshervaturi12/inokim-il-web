const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    /** 🔹 חנות כלליות **/
    storeName: { type: String, required: true, default: "החנות שלי" },
    storeEmail: { type: String, required: true, match: /.+\@.+\..+/ },
    storePhone: { type: String, required: true },
    storeLogo: { type: String }, // Store logo URL
    currency: { type: String, default: "₪" },
    timezone: { type: String, default: "Asia/Jerusalem" },
    language: { type: String, default: "he" }, // Default Hebrew

    /** 🔹 תשלומים (Payments) **/
    payment: {
      enableCashOnDelivery: { type: Boolean, default: true },
      enableCreditCard: { type: Boolean, default: true },
      enablePayPal: { type: Boolean, default: false },
      enableApplePay: { type: Boolean, default: false },
      enableGooglePay: { type: Boolean, default: false },
      creditCardGateway: { type: String, enum: ["PayPlus", "Tranzila", "Other"], default: "PayPlus" },
      paymentGatewayCredentials: { apiKey: String, secretKey: String },
    },

    /** 🔹 משלוחים (Shipping) - Linked to `ShippingPrice` Schema **/
    shippingMethods: [{ type: mongoose.Schema.Types.ObjectId, ref: "ShippingPrice" }],

    /** 🔹 התרעות (Notifications) **/
    notifications: {
      newOrderEmail: { type: Boolean, default: true },
      lowStockAlerts: { type: Boolean, default: true },
      abandonedCartEmails: { type: Boolean, default: false },
      orderStatusUpdates: { type: Boolean, default: true },
    },
    adminEmails: [{ type: String, match: /.+\@.+\..+/ }],
    /** 🔹 מסים (Taxes) **/
    tax: {
      enableTax: { type: Boolean, default: true },
      taxRate: { type: Number, default: 18 }, // Default VAT rate in Israel
      taxInclusive: { type: Boolean, default: true },
    },

    /** 🔹 SEO - Reference to `Seo` Schema **/
    seoSettings: { type: mongoose.Schema.Types.ObjectId, ref: "Seo" },

    /** 🔹 מדיניות החנות (Store Policies) - Reference to `Page` Schema **/
    policies: {
      returnPolicy: { type: mongoose.Schema.Types.ObjectId, ref: "Page" },
      termsOfService: { type: mongoose.Schema.Types.ObjectId, ref: "Page" },
      privacyPolicy: { type: mongoose.Schema.Types.ObjectId, ref: "Page" },
    },

    /** 🔹 תצוגת חנות (Store Display) **/
    storeDisplay: {
      showRelatedProducts: { type: Boolean, default: true },
      enableReviews: { type: Boolean, default: true },
      enableWishlist: { type: Boolean, default: true },
    },

    /** 🔥 אינטגרציות שיווקיות (Marketing Integrations) **/
    analytics: {
      googleAnalyticsId: { type: String }, 
      facebookPixelId: { type: String }, 
      googleTagManagerId: { type: String }, 
    },

    /** 🔹 הגדרות מתקדמות **/
    advanced: {
      maintenanceMode: { type: Boolean, default: false },
      enableAPIAccess: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
