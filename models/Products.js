const mongoose = require('mongoose');


const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hex: {
    type: String, // Hex code for color, e.g., #ff0000
  },
  sku: {
    type: String,
    // required: true,
  },
  inventoryQty: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  compareAtPrice: {
    type: Number, // Original price before discounts
  },
  costPrice: {
    type: Number, // Cost of manufacturing
  },
  image: {
    type: String, // Image URL specific to this color
  }
});

const suspensionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['קשיח', 'רך']
  },
 
})

const faqItemSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  }
});

const variantSchema = new mongoose.Schema({
  subModel: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  gallery: [
    {
      type: String, // URL for gallery images
    }
  ],
  colors: [colorSchema],
  suspensions: [suspensionSchema],
  availability: {
    type: String
  },
  range: {
    type: String
  },
  battary: {
    type: String
  },
  isPreOrder: {
    type: Boolean,
    default: false
  },
  pickupLocations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location' 
    }
  ]
});



const specItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // Optional Icon URL
  },
});

const specCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true, 
  },
  image: {
    type: String
  },
  items: [specItemSchema], // List of specs under this category
});


const mainInfoSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  img: {
    type: String
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String, // SEO-friendly title
    required: true
  },
  description: {
    type: String, // Detailed product description
  },
  overviewSubtitle: {
    type: String, // Short subtitle for the overview
  },
  overviewImage: {
    type: String, // URL for the product's main image
    // required: true
  },
safety: {
  safetyImg: {
    type: String, // תמונת רקע או אייקון מייצג
    required: false
  },
  safetyHeadline: {
    type: String, // כותרת ראשית
    required: false
  },
  safetySubheadline: {
    type: String, // כותרת משנה אם יש
    required: false
  },
  safetyDescription: {
    type: String, // טקסט תיאורי כללי
    required: false
  },
  safetyPoints: [
    {
      title: { type: String },     // כותרת לנקודת בטיחות, לדוגמה "בלימה חכמה"
      description: { type: String }, // תיאור קצר לכל נקודה
      icon: { type: String }         // אייקון או תמונה מייצגת
    }
  ],
  safetyVideoUrl: {
    type: String, // אם יש וידאו הדגמה
    required: false
  },
  safetyCtaText: {
    type: String, // טקסט לכפתור קריאה לפעולה
    required: false
  },
  safetyCtaLink: {
    type: String, // לינק לכפתור (כמו “למידע נוסף”)
    required: false
  },
  safetyOrder: {
    type: Number, // למקרה שתרצה לשלוט בסדר הופעת הסקשנים
    default: 0
  },
  safetyActive: {
    type: Boolean, // מאפשר להסתיר/להציג את הסקשן
    default: true
  }
},


  paymentInfoImage: {
    type: String
  },
  overviewVideo: {
    type: String, // Video URL or file path
  },
  variants: [variantSchema],
  specs: [specCategorySchema],
  mainInfo: [mainInfoSchema], 
  seo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seo',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    index: true
    // required: true
  },
  logoSvg: {
    type: String 
  },
  inventoryQty: {
    type: Number,
    default: 0,
  },
  templateType: {
    type: String,
    enum: ['scooter', 'default', 'special', 'kix', 'dubai'], // Example template types
    required: true
  },
  slug: {
    type: String,
    unique: true,
    required: true, // Highly recommended to avoid missing slugs
    trim: true,
    index: true
  },
  price: {
    type: Number
  },
  compareAtPrice: {
    type: Number
  },
  dealerPrice: {
    type: Number
  },
  colors: [String],
  gallery: [
    {
      type: String, 
    }
  ],
  // upsell: [upsellSchema],
  upsell: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upsell'
    }
  ],
  announcement: {
    text: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: ''
    },
    buttonLink: {
      type: String,
      default: ''
    },
    
    noVAT: {
      text: String,
      buttonText: String,
      buttonLink: String,
      isSale: Boolean,
    }
  },
  label: {
    type: String
  },
  status: {
    type: String,
    enum: ["active", "draft", "archived"],
    default: "active"
  },
  googleMerchant: {
    uploaded: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date
    },
    lastStatus: {
      type: String
    }
  },
  contentBlocks: [
    {
      type: {
        type: String,
        enum: ['text', 'image', 'imageWithText', 'video', 'customHTML'],
        required: true
      },
      title: String,
      content: String,
      image: String,
      alt: String,
      imagePosition: {
        type: String,
        enum: ['left', 'right'],
        default: 'right'
      },
      src: String,
      poster: String,
      html: String
    }
  ],

  faq: [faqItemSchema],

}, {
  timestamps: true 
});

productSchema.index({
  title: 'text',
  name: 'text',
})

module.exports = mongoose.model('Product', productSchema);


