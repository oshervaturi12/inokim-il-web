const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
  pageTitle: {
    type: String,
    required: true,
  },
  metaDescription: {
    type: String,
    required: true,
  },
  urlHandle: {
    type: String,
    required: true,
    unique: true,
  },
  canonicalUrl: {
    type: String, // Preferred URL to avoid duplicate content issues
  },
  ogTitle: {
    type: String, // Open Graph title for social media previews
  },
  ogDescription: {
    type: String, // Open Graph description for social media previews
  },
  ogImage: {
    type: String, // Image for social media previews
  },
  twitterTitle: {
    type: String, // Twitter Card title
  },
  twitterDescription: {
    type: String, // Twitter Card description
  },
  twitterImage: {
    type: String, // Twitter Card image
  },
  jsonLd: {
    type: mongoose.Schema.Types.Mixed, // JSON-LD for structured data (can be an object or array)
  },
  noIndex: {
    type: Boolean,
    default: false, // If true, prevents search engines from indexing this page
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Seo', seoSchema);


  // {
  //   "access_token": "ya29.a0AeXRPp5fZpxnBvDWYuY4XlGLy7UXEfOqy4mPTgrrl6fDnGCqVxh8hwBwpM4pwFF3ilyLll1C8kc1QPwAvop3oiyhQDmcszgk9iUOQJX2J4Yl6YmmTETAMsjoiZjsSIF5DihTDRKyodIAGw33iZJXPRTz4NVL9cdtn9NH89ZkaCgYKAcMSARESFQHGX2Mi0Y0u_yTehyy00P0HGNk6DA0175",
  //   "expires_in": 3599,
  //   "refresh_token": "1//03fGKvrbQXJTRCgYIARAAGAMSNwF-L9IrMTu97P3C304dOMxxfzsZEdaObptPS6BRo71GwA8ok_CVi7fO8hwEvYmfxFobzDTvuT8",
  //   "scope": "https://www.googleapis.com/auth/adwords",
  //   "token_type": "Bearer"
  // }
