const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String, // URL for the blog's cover image
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    // required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  tableOfContents: [{
    label: {
      type: String,
      required: true
    },
    anchor: {
      type: String,
      required: true
    }
  }],
  comments: [commentSchema], 
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Middleware to generate a slug before saving
blogSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 100); // Limit slug length
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
