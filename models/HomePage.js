// // models/HomePage.js
// const mongoose = require('mongoose');

// // const heroSchema = new mongoose.Schema({
// //   title: String,
// //   subtitle: String,
// //   buttonText: String,
// //   buttonLink: String,
// //   backgroundImage: String,
// //   mobileImage: String,

// //     noVAT: {
// //     title: String,
// //     subtitle: String,
// //     buttonText: String,
// //     buttonLink: String,
// //     backgroundImage: String,
// //     mobileImage: String,
// //   }
// // });


// const heroSchema = new mongoose.Schema({
//   title: {
//     he: String,
//     ar: String
//   },
//   subtitle: {
//     he: String,
//     ar: String
//   },
//   buttonText: {
//     he: String,
//     ar: String
//   },
//   buttonLink: String,
//   backgroundImage: String,
//   mobileImage: String,

//   noVAT: {
//     title: {
//       he: String,
//       ar: String
//     },
//     subtitle: {
//       he: String,
//       ar: String
//     },
//     buttonText: {
//       he: String,
//       ar: String
//     },
//     buttonLink: String,
//     backgroundImage: String,
//     mobileImage: String
//   }
// });



// const productHighlightSchema = new mongoose.Schema({
//   name: String,
//   productSlug: String,
//   overviewSlug: String,
//   range: String,
//   speed: String,
//   iconSvg: String,
//   order: Number,

//     noVAT: {
//     name: String,
//     productSlug: String,
//     overviewSlug: String,
//     range: String,
//     speed: String,
//     iconSvg: String,
//   }
// });

// const infoBlockSchema = new mongoose.Schema({
//   heading: String,
//   paragraph: String,
//   image: String,
//   buttonText: String,
//   buttonLink: String,

//     noVAT: {
//     heading: String,
//     paragraph: String,
//     image: String,
//     buttonText: String,
//     buttonLink: String,
//   }
// });

// const homePageSchema = new mongoose.Schema({
//   announcement: {
//     text: String,
//     buttonText: String,
//     buttonLink: String,
//     isSale: Boolean,

//     noVAT: {
//       text: String,
//       buttonText: String,
//       buttonLink: String,
//       isSale: Boolean,
//     }
//   },
//   hero: heroSchema,
//   productHighlightsTitle: String, 
//   productHighlightsImage: String, 
//   productHighlights: [productHighlightSchema],
//   infoBlock: infoBlockSchema,
//   imagesBelowInfo: [String],
//   specs: [{
//     image: String,
//     title: String,
//     description: String
//   }],
//   newsletterTitle: String,
//   newsletterSubtitle: String,
//   sliderImages: [String]
// }, { timestamps: true });

// module.exports = mongoose.model('HomePage', homePageSchema);



// models/HomePage.js
const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  title: { he: String, ar: String },
  subtitle: { he: String, ar: String },
  buttonText: { he: String, ar: String },
  buttonLink: String,
  backgroundImage: String,
  mobileImage: String,

  noVAT: {
    title: { he: String, ar: String },
    subtitle: { he: String, ar: String },
    buttonText: { he: String, ar: String },
    buttonLink: String,
    backgroundImage: String,
    mobileImage: String
  }
});

const productHighlightSchema = new mongoose.Schema({
  name: { he: String, ar: String },
  productSlug: String,
  overviewSlug: String,
  range: { he: String, ar: String },
  speed: { he: String, ar: String },
  iconSvg: String,
  order: Number,

  noVAT: {
    name: { he: String, ar: String },
    productSlug: String,
    overviewSlug: String,
    range: { he: String, ar: String },
    speed: { he: String, ar: String },
    iconSvg: String
  }
});

const infoBlockSchema = new mongoose.Schema({
  heading: { he: String, ar: String },
  paragraph: { he: String, ar: String },
  image: String,
  buttonText: { he: String, ar: String },
  buttonLink: String,

  noVAT: {
    heading: { he: String, ar: String },
    paragraph: { he: String, ar: String },
    image: String,
    buttonText: { he: String, ar: String },
    buttonLink: String
  }
});

const specSchema = new mongoose.Schema({
  image: String,
  title: { he: String, ar: String },
  description: { he: String, ar: String }
});

const homePageSchema = new mongoose.Schema(
  {
    announcement: {
      text: { he: String, ar: String },
      buttonText: { he: String, ar: String },
      buttonLink: String,
      isSale: Boolean,

      noVAT: {
        text: { he: String, ar: String },
        buttonText: { he: String, ar: String },
        buttonLink: String,
        isSale: Boolean
      }
    },
    hero: heroSchema,
    productHighlightsTitle: { he: String, ar: String },
    productHighlightsImage: String,
    productHighlights: [productHighlightSchema],
    infoBlock: infoBlockSchema,
    imagesBelowInfo: [String],
    specs: [specSchema],
    newsletterTitle: { he: String, ar: String },
    newsletterSubtitle: { he: String, ar: String },
    sliderImages: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomePage", homePageSchema);
