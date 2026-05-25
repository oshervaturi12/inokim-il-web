const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ABTest',
    required: false // optional if insight is general
  },
  source: {
    type: String,
    enum: ['ab_test', 'tracker', 'combined', 'cro', 'seo', 'orders', 'page_analysis'],
    required: true
  },
  type: {
    type: String,
    enum: ['html_analysis', 'text_section', 'performance'],
    required: false
  },
  key: String, // optional key (e.g., 'home.hero.button')
  title: String, // optional display title
  prompt: String, // original prompt sent to OpenAI
  response: String, // AI response
  model: String, // e.g., gpt-3.5-turbo
  url: String,
  tokenUsage: Number,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('AIInsight', aiInsightSchema);
