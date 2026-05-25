const mongoose = require('mongoose');


const faqItemSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  }
});


const contentBlockSchema = new mongoose.Schema({
  blockType: {
    type: String,
    enum: ['text', 'image', 'video', 'quote', 'gallery', 'customHTML', 'list', 'faq'],
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Can hold text, image URLs, or any custom content
  },
  faqItems: [faqItemSchema],
  order: {
    type: Number,
    default: 0, // Determines the display order of the block
  },
  styles: {
    type: Object, // Inline styles (e.g., { color: 'red', fontSize: '18px' })
  }
});

const metaTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  }
});

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true, // Used for clean URLs
    },
    description: {
      type: String,
    },
    contentBlocks: [contentBlockSchema], // Flexible blocks for page content
    featuredImage: {
      type: String, // URL to a featured image
    },
    seo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seo', // SEO settings from a separate schema
    },
    metaTags: [metaTagSchema], // Additional meta tags for SEO
    published: {
      type: Boolean,
      default: false,
    },
    layout: {
      type: String,
      enum: ['default', 'landing', 'blog', 'contact'],
      default: 'default',
    },
    customCSS: {
      type: String, // Allow custom CSS for the page
    },
    customJS: {
      type: String, // Allow custom JS for the page
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Page', pageSchema);
