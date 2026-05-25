const catchAsync = require('../util/catchAsync')
const AppError = require('../util/appError');
const User = require('../models/User');
const Page = require('./../models/Page')
const Blog = require('../models/Blog')
const Product = require('../models/Products')
const Category = require('../models/Category')
const {formatter, extractYouTubeId} = require('./helpers')
const Cart = require('../models/Cart')
const Order = require('../models/Order')
const {cacheQuery} = require('../middlewares/cacheQuery')
const ShippingPrice = require('../models/ShippingPrice');
const Video = require('../models/VideoSupport')
const Seo = require('../models/Seo');
const HomePage = require('../models/HomePage');
const he = require('he');
const s3path = process.env.S3PATH
const axios = require('axios');

const { getCache, setCache, deleteCache } = require('../util/cacheManager');
const CACHE_TTL = 1; // 1 hour

function applyABTestsToData(base, tests) {
  if (!base || !tests) return;

  for (const [key, variant] of Object.entries(tests)) {
    if (!variant?.content) continue;

    const pathParts = key.split('.');
    if (pathParts[0] !== 'home') continue;

    let current = base;
    let validPath = true;

    for (let i = 1; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        console.warn(`🔁 AB test path not found: ${pathParts[i]} in key ${key}`);
        validPath = false;
        break;
      }
      current = current[pathParts[i]];
    }

    if (!validPath) continue;

    const finalKey = pathParts[pathParts.length - 1];

    if (
      typeof variant.content === 'object' &&
      variant.content !== null &&
      !Array.isArray(variant.content)
    ) {
      current[finalKey] = {
        ...(current[finalKey] || {}),
        ...variant.content,
      };
    } else {
      current[finalKey] = variant.content;
    }

    console.log(`✅ Applied A/B variant for ${key}:`, variant.content);
  }
}

function applyNoVAT(base, override) {
  if (!override) return base;

  const merged = { ...base };

  for (const key of Object.keys(override)) {
    if (
      override[key] &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key])
    ) {
      merged[key] = applyNoVAT(base[key] || {}, override[key]);
    } else {
      merged[key] = override[key];
    }
  }

  return merged;
}

exports.renderHomePage = catchAsync(async (req, res, next) => {

  console.log("sessionId:", req.sessionID)


  const lang = req.getLocale?.() || 'he';

  if (req.query.refresh === 'true') {
    await deleteCache('home:data');
  }

  const [cachedSeo, cachedHome] = await Promise.all([
    getCache('home:seo'),
    getCache('home:data')
  ]);

  let seo = cachedSeo;
  let homePageData = cachedHome;

  // If not cached, fetch from DB
  if (!seo || !homePageData) {
    const [seoDoc, homeDoc] = await Promise.all([
      Seo.findOne({ urlHandle: 'home' }).lean(),
      HomePage.findOne().lean()
    ]);

    if (seoDoc) {
      seo = seoDoc;
      await setCache('home:seo', seo, CACHE_TTL);
    }

    if (homeDoc) {
      homePageData = homeDoc;
      // await setCache('home:data', homePageData, CACHE_TTL);
    }
  }

  if (!homePageData) {
    return res.status(404).render('error', { message: 'Home page data not found' });
  }

    if (req.noVAT) {
      if (homePageData.announcement?.noVAT) {
      homePageData.announcement = applyNoVAT(homePageData.announcement, homePageData.announcement.noVAT);
    }
       if (homePageData.hero?.noVAT) {
      homePageData.hero = applyNoVAT(homePageData.hero, homePageData.hero.noVAT);
    }
    }



  // Add OG image handling
  const siteUrl = `${req.protocol}://${req.get('host')}`;
  const ogImage = seo?.ogImage
    ? (seo.ogImage.startsWith('http') ? seo.ogImage : `${s3path}${seo.ogImage}`)
    : `${siteUrl}/img/default-og-image.png`;

  seo.ogImage = ogImage;



  // applyABTestsToData(homePageData, res.locals.abTests);





  res.render('home', {
    active: '/',
    title: "קורקינטים חשמליים מבית INOKIM - עמוד הבית",
    description: seo?.metaDescription || "Inokim - המותג המוביל לקורקינטים חשמליים מעוצבים, איכותיים ובטיחותיים בישראל. בקרו אותנו לקבלת מידע נוסף על הדגמים המובילים שלנו.",
    customClass: `${req.noVAT ? "bg-light": "bg-dark"}`,
    isHome: true,
    stickyNav: true,
    seo,
    themeColor: "#0000",
    home: homePageData,
    preload: homePageData.hero.backgroundImage,
    mobilePrelaod: homePageData.hero.mobileImage,
    s3path,
    abTests: res.locals.abTests,
  });
});



exports.renderFindUsPage = catchAsync (async (req, res, next) => {
    const seo = await Seo.findOne({ urlHandle: 'find-us' }).lean();

    const siteUrl = `${req.protocol}://${req.get('host')}`;

    const ogImage = seo?.ogImage 
        ? (seo.ogImage.startsWith('http') 
            ? seo.ogImage 
            : `${siteUrl}${seo.ogImage}`
        )
        : `${siteUrl}/img/default-og-image.png`;
  
       seo.ogImage = ogImage

    res.render('find-us', {
        active: '/fins-us',
        title: seo?.pageTitle || "מצא אותנו",
        description: seo?.metaDescription ||  "",
        customClass: "light",
         isHome: false ,
         stickyNav: true,
         seo
    })
})




exports.renderProduct = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const breadcrumbs = [
    { label: 'אביזרים וחלקי חילוף', url: '/category/spare-parts' },
    { label: slug, url: `/${slug}` }
  ];


  const product = await Product.findOne({ slug })
    .select("name title description overviewSubtitle overviewImage variants specs mainInfo seo category logoSvg inventoryQty templateType slug price compareAtPrice dealerPrice gallery announcement status paymentInfoImage colors suspensions label faq")
    .populate('seo')
    .populate('seo')
    .populate({
      path: 'upsell',
      populate: {
        path: 'product',
        select: 'name title price overviewImage variants'
      }
    })
    .lean()


  if (!product) {
    return next(new AppError('Product not found', 404));
  }



  if (req.noVAT) {
    // 1. announcement merge
    if (product.announcement?.noVAT) {
      product.announcement = applyNoVAT(product.announcement, product.announcement.noVAT);
      product.upsell = false;
    }


    const adjustPrice = (val) => (val ? Number((val / 1.18).toFixed(2)) : val);

    product.price = adjustPrice(product.price);
    product.compareAtPrice = adjustPrice(product.compareAtPrice);
    product.dealerPrice = adjustPrice(product.dealerPrice);

    if (Array.isArray(product.variants)) {
    product.variants = product.variants.map(v => {
      if (Array.isArray(v.colors)) {
        v.colors = v.colors.map(c => ({
          ...c,
          price: adjustPrice(c.price),
          compareAtPrice: adjustPrice(c.compareAtPrice),
          dealerPrice: adjustPrice(c.dealerPrice)
        }));
      }
      return v;
    });
  }
    if (Array.isArray(product.colors)) {
      product.colors = product.colors.map(c => ({
        ...c,
        price: adjustPrice(c.price),
        compareAtPrice: adjustPrice(c.compareAtPrice),
      }));
    }
  }


  if (product?.variants) {
    product.variants.sort((a, b) => a.order - b.order);
  }


  const ogImage = product.seo?.ogImage
    ? product.seo.ogImage
    : product.overviewImage
    ? `${s3path}${product.overviewImage}`
    : product.gallery?.length > 0
    ? `${s3path}${product.gallery[0]}`
    : `${s3path}/img/default-og-image.png`;


  const productType = product.templateType;
  const TEMPLATE_MAP = {
    'kix': 'product-scooter',
    'scooter': 'product-scooter',
    'special': 'product-default',
    'dubai': 'product-scooter'
  };




  const template = TEMPLATE_MAP[productType] || 'product-default';

  let relatedProducts = [];
  if (template === 'product-default') {
    relatedProducts = await Product.find({
      _id: { $ne: product._id },
      status: "active",
      templateType: "default"
    })
      .select('title slug overviewImage price seo')
      .limit(3)
      .lean();
  }

  const plainDescription = stripHtml(product.description);

  console.log(product.variants)


  // --- Render ---
  res.render(template, {
    active: '/product',
    customClass: "light",
    isHome: false,
    product,
    announcement: product.announcement,
    title: product.title,
    description: product.seo ? product.seo.metaDescription : '',
    seo: {
      ...product.seo,
      ogImage,
      metaDescription: product.seo?.metaDescription || plainDescription || 'Default product description'
    },
    formatter,
    breadcrumbs,
    stickyNav: false,
    relatedProducts,
    s3path: process.env.S3PATH,
 
  });
});


const stripHtml = (html) => {
  return html?.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
};

function applyPriceAdjustments(product, noVAT) {
  if (!noVAT) return product;

  const adjustPrice = (val) => (val ? Number((val / 1.18).toFixed(2)) : val);

  if (product.announcement?.noVAT) {
    product.announcement = applyNoVAT(product.announcement, product.announcement.noVAT);
  }

  product.price = adjustPrice(product.price);
  product.compareAtPrice = adjustPrice(product.compareAtPrice);
  product.dealerPrice = adjustPrice(product.dealerPrice);

  if (Array.isArray(product.variants)) {
    product.variants = product.variants.map(v => {
      if (Array.isArray(v.colors)) {
        v.colors = v.colors.map(c => ({
          ...c,
          price: adjustPrice(c.price),
          compareAtPrice: adjustPrice(c.compareAtPrice),
          dealerPrice: adjustPrice(c.dealerPrice)
        }));
      }
      return v;
    });
  }

  if (Array.isArray(product.colors)) {
    product.colors = product.colors.map(c => ({
      ...c,
      price: adjustPrice(c.price),
      compareAtPrice: adjustPrice(c.compareAtPrice),
    }));
  }

  return product;
}


exports.renderOverviewProduct = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const cacheKey = `product:${slug}/overview`;

  // Fetch product from DB
  const product = await Product.findOne({ slug })
      .populate('seo')
      .lean();

  if (!product) {
      return next(new AppError('Product not found', 404));
  }
  applyPriceAdjustments(product, req.noVAT);


  let hasInventory = false;

  if (product.templateType === 'scooter' && product.variants.length > 0) {

      hasInventory = product.variants?.flatMap(v => v.colors).some(c => c.inventoryQty > 0);

  }


  const ogImage = product.seo?.ogImage
      ? product.seo.ogImage
      : product.overviewImage
      ? `${s3path}${product.overviewImage}`
      : product.gallery?.length > 0
      ? `${s3path}${product.gallery[0]}`
      : `${s3path}/img/default-og-image.png`;



  const productType = product.templateType;
  const TEMPLATE_MAP = {
    'kix': 'product-kix',
    'scooter': 'productOverview',
    'special': 'product-special-overview',
    'dubai': 'new-ox'
  };

  const featuresSlides = [
    {
      image: '/optimized/newOx/alarm.png',
      title: 'אזעקה חכמה',
      subtitle: 'שליטה מלאה מרחוק',
      description: 'מערכת אבטחה מתקדמת עם התראות בזמן אמת ושליטה מכל מקום',
    },
    {
      image: '/optimized/newOx/alarm2.png',
      title: 'הגנה מתקדמת',
      subtitle: 'שכבת ביטחון נוספת',
      description: 'מערכת חכמה שמגנה על הכלי שלך גם כשאתה לא לידו',
    },
    {
      image: '/optimized/newOx/control.png',
      title: 'שליטה מלאה',
      subtitle: 'ממשק חכם',
      description: 'גישה מהירה לכל נתוני הרכיבה והשליטה על הכלי',
    },
    {
      image: '/optimized/newOx/nfc.png',
      title: 'פתיחה עם NFC',
      subtitle: 'ללא מפתח',
      description: 'גישה מאובטחת רק למורשים עם טכנולוגיה מתקדמת',
    },
    {
      image: '/optimized/newOx/gps.png',
      title: 'תצוגה מתקדמת',
      subtitle: 'צג חכם',
      description: 'מידע ברור ומדויק בכל רגע במהלך הרכיבה',
    },
  ];

  const faqItems = [
    {
      question: 'מה ההבדל בין גרסת 48V לגרסת 60V?',
      answer:
        'גרסת 48V מיועדת לרכיבה עירונית חכמה, נינוחה ויעילה ליום-יום. גרסת 60V מעניקה חוויית רכיבה חזקה יותר, עם תאוצה משופרת ותחושת שליטה מדויקת יותר למי שמחפש ביצועים גבוהים יותר.',
    },
    {
      question: 'האם ל-Inokim OX החדש יש מערכת אבטחה חכמה?',
      answer:
        'כן. הדגם כולל מעטפת אבטחה מתקדמת הכוללת שלט חכם, NFC לפתיחה מאובטחת, ואפשרות מעקב GPS דרך האפליקציה, כך שהרוכב נהנה משכבת הגנה מתקדמת ושליטה רחבה יותר.',
    },
    {
      question: 'האם ניתן לעקוב אחרי הכלי דרך אפליקציה?',
      answer:
        'כן. האפליקציה מאפשרת צפייה בנתונים בזמן אמת, מעקב אחר מיקום, וקבלת גישה למידע חשוב על הרכיבה והכלי בצורה נוחה וברורה.',
    },
    {
      question: 'למי הקורקינט הזה מתאים?',
      answer:
        'ה-Inokim OX החדש מתאים לרוכבים שמחפשים שילוב של עיצוב פרימיום, נוחות, יציבות, טכנולוגיה מתקדמת וביצועים ברמה גבוהה לשימוש עירוני ולרכיבות ארוכות יותר.',
    },
    {
      question: 'האם הקורקינט מתאים גם לרחובות פחות מושלמים?',
      answer:
        'בהחלט. הדגם פותח כדי להתמודד טוב יותר עם תנאי כביש אמיתיים, עם דגש על יציבות, שליטה ואחיזה טובה יותר במהלך הרכיבה.',
    },
    {
      question: 'באילו צבעים הדגם זמין?',
      answer:
        'נכון לעמוד זה, הדגם מוצג בשני צבעי פרימיום לבחירה. ניתן לעדכן את הרשימה הסופית בהתאם למלאי ולדגמים הזמינים בפועל.',
    },
  ];

  const template = TEMPLATE_MAP[productType] || 'product-default';

  // Determine which template to render
  // const template = product.templateType === 'special' ? 'product-special-overview' : 'productOverview';
  const plainDescription = stripHtml(product.description);


  // Pass relevant data based on product type
  let templateData = {
      active: '/overview',
      title: "תיאור המוצר",
      description: "",
      customClass: "bg-dark",
      isHome: true,
      product,
      seo: {
          ...product.seo,
          ogImage,
          metaDescription: product.seo?.metaDescription || plainDescription || 'Default product description'
      },
      formatter,
      stickyNav: false,
      themeColor: "#0000",
      hasInventory,
      s3path,
      featuresSlides,
      faqItems

  };

  // If special product, send only necessary fields
  if (product.templateType === 'special') {
      templateData = {
          ...templateData,
          logoSvg: product.logoSvg,
          title: product.title,
          price: product.price,
          overviewImage: product.overviewImage,
          overviewImageMobile: product.paymentInfoImage, // Assuming this is the mobile version
          video: product.overviewVideo,
          description: product.description,
          mainFeatures: product.mainInfo, // Main features with icons
          specs: product.specs,
          s3path,
          announcement: product.announcement,
          slug: product.slug,
          specs: product.specs,
          logoSvg: product.logoSvg,
          overviewVideo: product.overviewVideo,
      };
  }

    if (product.templateType === 'kix') {
      templateData = {
          ...templateData,
          logoSvg: product.logoSvg,
          title: product.title,
          price: product.price,
          overviewImage: product.overviewImage,
          overviewImageMobile: product.paymentInfoImage, 
          video: product.overviewVideo,
          description: product.description,
          mainFeatures: product.mainInfo, 
          specs: product.specs,
          s3path,
          announcement: product.announcement,
          slug: product.slug,
          specs: product.specs,
          logoSvg: product.logoSvg,
          overviewVideo: product.overviewVideo,
      };
  }

  res.render(template, templateData);
});



exports.renderDynamicPage = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
  
    const cacheKey = `page:${slug}`;
    // Fetch the page by slug from the database
    // const page = await Page.findOne({ slug }).populate('seo').lean();

    // const page = await cacheQuery(
    //   cacheKey,
    //   () =>
    //     Page.findOne({ slug })
    //       .populate('seo')
    //       .lean(),
    //   3600 
    // );

       const page = await 
        Page.findOne({ slug })
          .populate('seo')
          .lean();


    // console.log(page)
  
    // If the page doesn't exist, return a 404
    if (!page) {
        return next(new AppError('העמוד לא נמצא', 404))
    }

    const breadcrumbs = [
        { label: 'דף הבית', url: '/' },
        { label: page.title, url: `/${slug}` }
      ];
  
    // Render the dynamic EJS page
    res.render('page', {
      active: `/${slug}`,
      title: page.title,
      description: page.seo ? page.seo.metaDescription : '',
      seo: page.seo,
      contentBlocks: page.contentBlocks,
      customClass:  'light',
      isHome: slug === 'home',
      breadcrumbs,
      stickyNav: true
    });
  });


  
exports.renderSitemap = catchAsync(async (req, res, next) => {
    // Fetch data from the database
    const [categories, pages, products] = await Promise.all([
        Category.find({}).select('name slug'),
        Page.find({ published: true }).select('title slug'),
        Product.find({}).select('name _id'),
      ]);
  
    // Build dynamic sitemap entries
    const sitemapEntries = [
      {
        title: 'עמודים',
        links: pages.map(page => ({
          label: page.title,
          url: `/${page.slug}`,
        })),
      },
      {
        title: 'קטגוריות',
        links: categories.map(category => ({
          label: category.name,
          url: `/category/${category.slug}`,
        })),
      },
      {
        title: 'מוצרים',
        links: products.map(product => ({
          label: product.name,
          url: `/product/${product._id}`,
        })),
      },
    ];
  
    // Render the sitemap dynamically
    res.render('sitemap', {
      title: 'מפת האתר - Inokim',
      sitemapEntries,
      customClass:  'light',
      isHome:  false,
      stickyNav: true
    });
  });


  

  exports.renderFaq = catchAsync (async (req, res, next) =>{

    const cacheKey = `page:faq`

    // const faq = await Page.findOne({ slug: "faq" })
    // .populate('seo')
    // .lean(); 


    const faq = await cacheQuery(
      cacheKey,
      () =>
        Page.findOne({ slug: "faq" })
          .populate('seo')
          .lean(),
      3600 
    );


    const breadcrumbs = [
        { label: 'דף הבית', url: '/' },
        { label: faq.title, url: `/${faq.slug}` }
      ];
      res.render('faq', {
        active: `/${faq.slug}`,
        title: faq.title,
        description: faq.seo ? faq.seo.metaDescription : '',
        seo: faq.seo,
        contentBlocks: faq.contentBlocks,
        customClass:  'light',
        isHome: faq.slug === 'home',
        breadcrumbs,
        faq,
        stickyNav: true
      });

  })


  exports.renderAboutUs =  catchAsync( async (req, res, next) =>{

    const cacheKey = `page:about-inokim`;

    const page = await cacheQuery(
      cacheKey,
      () =>
        Page.findOne({ slug : "about-inokim"})
          .populate('seo')
          .lean(),
      3600 
    );

    // const page = await Page.findOne({ slug: 'about-inokim' })
    // .populate('seo')
    // .lean(); 

    if (!page) {
      return next(new AppError('העמוד לא נמצא', 404));
    }

    res.render('about', {
      active: `/${page.slug}`,
      title: page.title,
      description: page.seo ? page.seo.metaDescription : '',
      seo: page.seo,
      contentBlocks: page,
      customClass:  'bg-dark',
      isHome: true,
      stickyNav: true,
      themeColor: "#5d5d5d",
      s3path: process.env.S3PATH
    });
  })


  exports.renderTestRide =  catchAsync( async (req, res, next) =>{
    const seo = await Seo.findOne({ urlHandle: 'test-ride' }).lean();

    res.render('test-drive', {
      active: `/`,
      title: seo?.pageTitle || "קבעו נסיעת מבחן עם Inokim",
      description:  '',
      customClass: 'light',
      isHome: false,
      seo,
      s3path
    });
  })



  exports.renderCategories = catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    // const user = res.locals.user || null; 
    // console.log("Current User:", user);

    const slugMap = {
      "accessories": "אביזרים נלווים",
      "spare-parts": "חלקי חילוף"
    }


    const seo = await Seo.findOne({ urlHandle: slug }).lean();

    res.render('parts', {
        title: `${slugMap[slug]}`,
        description: 'כל הקטגוריות הזמינות באתר',
        customClass: 'categories-page',
        isHome: false,
        customClass: 'light',
        seo,
        s3path: process.env.S3PATH,
        cat: slug
    });
});


exports.renderLogin = catchAsync(async (req, res, next) => {
  const { user } = res.locals;

  if (user) {
    if (user.role === 'customer') return res.redirect('/account');
    if (user.role === 'admin') return res.redirect('/admin/dashboard');
  }

  res.render('login', {
    title: 'התחבר למערכת',
    description: 'התחברות',
    isHome: false,
    customClass: 'light',
    s3path,
    user
  });
});


exports.renderMyAcounet = catchAsync (async (req, res, next) =>{



  const user = res.locals.user || null; // ✅ Correct way to get the logged-in user

  const orders = await Order.find({ userId: user._id });
  // console.log(orders)
  res.render('myAccount', {
    title: 'התחבר למערכת',
    description: 'התחברות',
    customClass: 'categories-page',
    isHome: false,
    customClass: 'light',
     orders

});
})


exports.renderContactUs = catchAsync(async (req, res, next) =>{
  const seo = await Seo.findOne({ urlHandle: 'contact-us' }).lean();
  res.render('contact-us', {
    title: seo?.pageTitle || "צור קשר עם Inokim",
    description: seo?.metaDescription || "פנו אלינו בכל שאלה או בקשה - אנחנו כאן לשירותכם.",
    isHome: false,
    customClass: 'light',
    seo
});
})


exports.renderMainBlog = catchAsync(async (req, res, next) =>{

  const seo = await Seo.findOne({ urlHandle: 'blog' }).lean();

  const blogs = await Blog.find({})

  res.render('blog', {
    title: seo?.pageTitle || 'חדשות אינוקים',
    description: seo?.metaDescription || 'כל מה שחדש ומעניין על אינוקים',
    isHome: false,
    customClass: 'light',
    blogs,
    seo
});
})



exports.renderBlogPost = catchAsync(async (req, res, next) =>{
  const { slug } = req.params;



  const blog = await Blog.findOne({ slug }).populate('author');

  const breadcrumbs = [
    { label: 'חדשות', url: '/blog' },
    { label: blog.title, url: `/${slug}` }
  ];

  const relatedPosts = await Blog.find({ 
    _id: { $ne: blog._id }, 
    isPublished: true 
  })
  .sort({ publishedAt: -1 })
  .limit(3)
  .select('title slug coverImage publishedAt excerpt');

  if (!blog) {
    return next(new AppError('פוסט הבלוג לא נמצא', 404));
  }

  blog.content = he.decode(blog.content);


  const seo = {
    pageTitle: blog.title,
    metaDescription: blog.excerpt || blog.content.slice(0, 160),
    canonicalUrl: `https://il.inokim.com/blog/${blog.slug}`,
    ogTitle: blog.title,
    ogDescription: blog.excerpt || '',
    ogImage: blog.coverImage?.startsWith('http') 
      ? blog.coverImage 
      : `https://il.inokim.com${blog.coverImage}`,
    twitterTitle: blog.title,
    twitterDescription: blog.excerpt || '',
    twitterImage: blog.coverImage?.startsWith('http') 
      ? blog.coverImage 
      : `https://il.inokim.com${blog.coverImage}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "image": blog.coverImage?.startsWith('http') 
        ? blog.coverImage 
        : `https://il.inokim.com${blog.coverImage}`,
      "author": {
        "@type": "Person",
        "name": blog.author?.name || "Inokim"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Inokim",
        "logo": {
          "@type": "ImageObject",
          "url": "https://il.inokim.com/optimized/favicon_512.png"
        }
      },
      "datePublished": blog.publishedAt,
      "url": `https://il.inokim.com/blog/${blog.slug}`
    }
  };



  res.render('blogPost', {
    title: 'חדשות אינוקים',
    description: 'כל מה שחדש ומעניין על אינוקים',
    isHome: false,
    customClass: 'light',
    blog,
    breadcrumbs, 
    relatedPosts,
    seo
});
})



exports.renderShopPage = catchAsync(async (req, res, next) => {
  const [scooters, otherProducts, seo] = await Promise.all([
    Product.find({ templateType: 'scooter', status: 'active' }).limit(8),
    Product.find({ category: "67bd69a3c1d73e0a72d9ff92", status: 'active' }).limit(3),
    Seo.findOne({ urlHandle: 'shop' }),
  ]);

  res.render('shop', {
    title: seo?.pageTitle || 'חנות אינוקים',
    description: seo?.metaDescription || 'כל מה שחדש ומעניין על אינוקים',
    isHome: true,
    customClass: "bg-dark",
    scooters,
    products: otherProducts,
    formatter,
    themeColor: "#0000",
    seo,
    s3path
  });
});




// exports.renderCheckoutPage = catchAsync( async (req, res, next) => {

//    const user = res.locals.user || null;
//     const sessionId = req.sessionID; 

//     // Fetch cart data from the database
//     const [cart, shippingPrices] = await Promise.all([
//       Cart.findOne({ sessionId }).populate('coupon').lean(),
//       ShippingPrice.find({ active: true })
//     ]);
  
//     if (!cart || cart.items.length === 0) {
//       return next(new AppError('עגלת הקניות שלך ריקה', 404));
//     }


//     const allowShipping = cart.totalPrice > 3500


//     res.render('checkout', {
//       title: 'Checkout - INOKIM',
//       description: 'Checkout - INOKIM',
//       cart,
//       customClass: 'checkout',
//       isHome: false,
//       formatter,
//       allowShipping,
//       shippingPrices,
//       user
//     });

// });

exports.renderCheckoutPage = catchAsync(async (req, res, next) => {
    const user = res.locals.user || null;
    const sessionId = req.sessionID; 
    const cartId = req.params.cartId; 

    // console.log("Session ID:", req.sessionID);

    const [cart, shippingPrices] = await Promise.all([
      Cart.findOne({ _id: cartId }).populate('coupon').lean(),
      ShippingPrice.find({ active: true })
    ]);
  
    console.log("Cart Data:", cart);

    if (!cart || cart.items.length === 0) {
      return next(new AppError('עגלת הקניות שלך ריקה או לא נמצאה', 404));
    }

    const allowShipping = cart.totalPrice > 3500;
     const hasCoupon = cart.coupon ? true : false;

    res.render('checkout', {
      title: 'Checkout - INOKIM',
      description: 'Checkout - INOKIM',
      cart,
      customClass: 'checkout',
      isHome: false,
      formatter, 
      allowShipping,
      shippingPrices,
      user,
      hasCoupon
    });
});



exports.renderMyOrders = catchAsync(async (req, res, next) =>{

  const {user} = res.locals

  const orders = await Order.find({ user: user._id });

  res.render('shop', {
    title: 'ההזמנות שלי',
    description: '',
    isHome: false,
    customClass: 'light',
    orders
});
})

exports.renderMySettings = catchAsync(async (req, res, next) =>{


    res.render('user-settings', {
    title: 'הגדרות משתמש',
    description: '',
    isHome: false,
    customClass: 'light',
});
})


exports.renderMyWarranty = catchAsync(async (req, res, next) =>{

  res.render('warranty', {
  title: 'תעודות אחריות',
  description: '',
  isHome: false,
  customClass: 'light',
});
})


exports.renderDealerContact = catchAsync(async (req, res, next) =>{

   const seo = await Seo.findOne({ urlHandle: 'distributors-registration' }).lean();

  res.render('dealerContact', {
    title: seo?.pageTitle || "הרשמה למפיצים - Inokim",
    description: seo?.metaDescription || "הצטרפו לרשת המפיצים של Inokim והפכו לחלק מההצלחה.",
    isHome: false,
    customClass: 'light',
    seo
  });
})


exports.renderTradeIn = catchAsync(async (req, res, next) =>{

  const seo = await Seo.findOne({ urlHandle: '/trade-in' }).lean();
  res.render('tradeIn', {
    title: seo?.pageTitle || "טרייד אין באינוקים",
    description: seo?.metaDescription || "קבלו הצעת טרייד אין משתלמת באינוקים וצאו עם אינוקים חדש!",
    isHome: false,
    customClass: 'light',
     seo
  });
})


exports.renderSupportPage = catchAsync(async (req, res, next) =>{

  const seo = await Seo.findOne({ urlHandle: 'support' }).lean();

  const cacheKey = `support`;

  const data = await cacheQuery(
    cacheKey,
    () =>
      Video.find({})
        .lean(),
    3600 
  );

  // const data = await Video.find({})

  // console.log(data)

  res.render('support', {
    title: seo?.pageTitle || "תמיכה טכנית - Inokim",
    description: seo?.metaDescription || "סרטוני הדרכה ומדריכים מקצועיים לשימוש בקורקינטים החשמליים של Inokim.",
    isHome: false,
    customClass: 'light',
    data,
    seo
  });
})



exports.renderSupportPageModel = catchAsync(async (req, res, next) =>{


  const {slug} = req.params

  const cacheKey = `support: ${slug}`;

  const data = await cacheQuery(
    cacheKey,
    () =>
      Video.find({slug})
        .lean(),
    3600 
  );

  const breadcrumbs = [
    { label: 'תמיכה ועזרה', url: '/support' },
    { label: slug, url: `/${slug}` }
  ];

  res.render('supportModel.ejs', {
    title: 'הכר את האינוקים שלך',
    description: '',
    isHome: false,
    customClass: 'light',
    data,
    extractYouTubeId,
    breadcrumbs
  });
})


exports.renderPaymentPage = catchAsync(async (req, res, next) =>{

  const {pageId} = req.params

  const shippingMap = {
    "self_pickup": "איסוף עצמי",
    "home_delivery": "אינוקים עד הבית"
  }

  const order = await Order.findOne({paymentGatewayPageId: pageId})


  const fullLink = `https://payments.payplus.co.il/${pageId}`


  res.render('payment', {
    title: 'תשלום',
    description: '',
    isHome: false,
    // customClass: 'light',
    customClass: 'checkout',
    order,
    formatter,
    fullLink,
    shippingMap
  });
})


// exports.renderThankYouPage = catchAsync(async (req, res, next) =>{

//   const id = req.params.id


// const order = await Order.findById(id).lean();


// console.log(order)


//   res.render('thank-you', {
//     title: 'תשלום',
//     description: '',
//     isHome: false,
//     customClass: 'light',
//     order,
//   });
// })




exports.renderThankYouPage = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findById(id).lean();

  if (!order) {
    return next(new AppError('הזמנה לא נמצאה', 404));
  }

  // console.log('Order details:', order); 

  if (order.paymentType === 'paymentPhone' && !order.isLeadSent) {
    try {
      const leadData = {
        status: "new",
        leadType: "website",
        tag: "תשלום טלפוני",
        phone: order.contactInfo?.phone || "",
        fullName: `${order.contactInfo?.firstName || ""} ${order.contactInfo?.lastName || ""}`.trim(),
        createdAt: order.createdAt || new Date(),
        notes: `מתעניין במוצר: ${order.items.map(item => item.prdName).join(', ')}. הערות נוספות: ${order.notes || 'אין'}`,  
      };

      // console.log('Sending lead to CRM:', leadData);

      const crmResponse = await axios.post('https://osher.herokuapp.com/api/v1/leads', leadData);
      // console.log('Lead sent to CRM successfully:', crmResponse.data);

      await Order.updateOne({ _id: id }, { $set: { isLeadSent: true } });

    } catch (error) {
      console.error('❌ Error sending lead to CRM:', error.response?.data || error.message);
    }
  }

req.session.destroy((err) => {
    if (err) {
      console.error(" Failed to destroy session on thank you page:", err);
    } else {
      // console.log("Session successfully destroyed. Cart is now empty.");
    }
    
    res.render('thank-you', {
      title: 'תשלום',
      description: '',
      isHome: false,
      customClass: 'light',
      order,
    });
  });
});


exports.renderLoanPage = catchAsync(async (req, res, next) =>{  

  // const seo = await Seo.findOne({ urlHandle: 'loan' }).lean();

  res.render('loan', {
    title:  "הוראת קבע באינוקים",
    description:  "קבלו הוראת קבע משתלמת באינוקים והפכו לבעלים של קורקינט חשמלי חדש!",
    isHome: false,
    customClass: 'light',
    // seo
  });
})


exports.renderTestKix = catchAsync(async (req, res, next) => {

  const featuresSlides = [
    {
      image: '/optimized/newOx/alarm.png',
      title: 'אזעקה חכמה',
      subtitle: 'שליטה מלאה מרחוק',
      description: 'מערכת אבטחה מתקדמת עם התראות בזמן אמת ושליטה מכל מקום',
    },
    {
      image: '/optimized/newOx/alarm2.png',
      title: 'הגנה מתקדמת',
      subtitle: 'שכבת ביטחון נוספת',
      description: 'מערכת חכמה שמגנה על הכלי שלך גם כשאתה לא לידו',
    },
    {
      image: '/optimized/newOx/control.png',
      title: 'שליטה מלאה',
      subtitle: 'ממשק חכם',
      description: 'גישה מהירה לכל נתוני הרכיבה והשליטה על הכלי',
    },
    {
      image: '/optimized/newOx/nfc.png',
      title: 'פתיחה עם NFC',
      subtitle: 'ללא מפתח',
      description: 'גישה מאובטחת רק למורשים עם טכנולוגיה מתקדמת',
    },
    {
      image: '/optimized/newOx/gps.png',
      title: 'תצוגה מתקדמת',
      subtitle: 'צג חכם',
      description: 'מידע ברור ומדויק בכל רגע במהלך הרכיבה',
    },
  ];

  const faqItems = [
    {
      question: 'מה ההבדל בין גרסת 48V לגרסת 60V?',
      answer:
        'גרסת 48V מיועדת לרכיבה עירונית חכמה, נינוחה ויעילה ליום-יום. גרסת 60V מעניקה חוויית רכיבה חזקה יותר, עם תאוצה משופרת ותחושת שליטה מדויקת יותר למי שמחפש ביצועים גבוהים יותר.',
    },
    {
      question: 'האם ל-Inokim OX החדש יש מערכת אבטחה חכמה?',
      answer:
        'כן. הדגם כולל מעטפת אבטחה מתקדמת הכוללת שלט חכם, NFC לפתיחה מאובטחת, ואפשרות מעקב GPS דרך האפליקציה, כך שהרוכב נהנה משכבת הגנה מתקדמת ושליטה רחבה יותר.',
    },
    {
      question: 'האם ניתן לעקוב אחרי הכלי דרך אפליקציה?',
      answer:
        'כן. האפליקציה מאפשרת צפייה בנתונים בזמן אמת, מעקב אחר מיקום, וקבלת גישה למידע חשוב על הרכיבה והכלי בצורה נוחה וברורה.',
    },
    {
      question: 'למי הקורקינט הזה מתאים?',
      answer:
        'ה-Inokim OX החדש מתאים לרוכבים שמחפשים שילוב של עיצוב פרימיום, נוחות, יציבות, טכנולוגיה מתקדמת וביצועים ברמה גבוהה לשימוש עירוני ולרכיבות ארוכות יותר.',
    },
    {
      question: 'האם הקורקינט מתאים גם לרחובות פחות מושלמים?',
      answer:
        'בהחלט. הדגם פותח כדי להתמודד טוב יותר עם תנאי כביש אמיתיים, עם דגש על יציבות, שליטה ואחיזה טובה יותר במהלך הרכיבה.',
    },
    {
      question: 'באילו צבעים הדגם זמין?',
      answer:
        'דגם האוקס דובאי מגיע בשני צבעי פרמיום לבחירה: אפור/צהוב או אפור/כתום.',
    },
  ];

  res.render('new-ox', {
    title: 'Test Kix',
    description: 'Test Kix',
    isHome: false,
    customClass: 'bg-dark',
    faqItems,
    featuresSlides,
  });
});




exports.renderPurchaseGroup = catchAsync(async (req, res, next) => {
  let homePageData = await getCache('home:data');

  // If not cached, fetch from DB
  if (!homePageData) {
    const homeDoc = await HomePage.findOne().lean();

    if (homeDoc) {
      homePageData = homeDoc;
    }
  }

  res.render('purchase-group', {
    title: 'קבוצת רכישה לסטודנטים |אינוקים קורקינטים חשמליים',
    description: 'קבוצת רכישה ייחודית לסטודנטים בירושלים בשיתוף אינוקים והתעוררות ירושלים. קורקינטים חשמליים איכותיים במחיר סטודנטיאלי, כמות מוגבלת ואחריות מלאה.',
    isHome: false,
    customClass: 'bg-light2',
    home: homePageData,
  });
});




// exports.rendeLeadsPage = catchAsync(async (req, res, next) =>{  

//   // const seo = await Seo.findOne({ urlHandle: 'loan' }).lean();

//   res.render('leads', {
//     title:  "leads",
//     description:  "",
//     isHome: false,
//     customClass: 'light',
//     // seo
//   });
// })

exports.rendeLeadsPage = catchAsync(async (req, res, next) => {
  return res.redirect(301, 'https://catalog.inokim.com/');
});




const { getTrackerSummaryForAI } = require('../services/analyticsService');

async function testTrackerSummary() {
  try {

    const summary = await getTrackerSummaryForAI();

    // console.log(summary);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}


const DailyABTestInsightJob = require('./../jobs/dailyAbTestInsightJob');

async function test() {
  try {

    const summary = await DailyABTestInsightJob.run();

    // console.log(summary);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// test()


const SiteAnalyzer = require('./../services/SiteAnalyzer');
const fetchHtml = require('./../util/fetchHtml');

async function testFetchAndAnalyze() {
  const baseUrl = 'https://il.inokim.com';
  const pagePath = '/';
  const fullUrl = baseUrl + pagePath;

  // console.log(`🔍 Fetching HTML from ${fullUrl}`);
  const { html } = await fetchHtml(fullUrl);

  if (!html) {
    console.warn('⚠️ No HTML returned');
    return;
  }

  // console.log(html)
   const analyzer = new SiteAnalyzer(baseUrl);

  //  console.log('🧠 Analyzing with SiteAnalyzer...');
   const insight = await analyzer.analyzeHTML(html, pagePath, 'home');

  //  console.log('\n💡 AI Insight:\n', insight);
}


  // testFetchAndAnalyze();
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');


const { Parser } = require('json2csv');



// (async () => {
//   try {

//     const products = await Product.find({}, {
//       name: 1,
//       title: 1,
//       price: 1,
//       compareAtPrice: 1,
//       variants: 1
//     }).lean();

//     const flatProducts = [];

//     products.forEach(product => {
//       if (Array.isArray(product.variants) && product.variants.length > 0) {
//         product.variants.forEach(variant => {
//           flatProducts.push({
//             name: product.name,
//             title: product.title,
//             variantSubModel: variant.subModel,
//             price: product.price,
//             compareAtPrice: product.compareAtPrice
//           });
//         });
//       } else {
//         flatProducts.push({
//           name: product.name,
//           title: product.title,
//           variantSubModel: '',
//           price: product.price,
//           compareAtPrice: product.compareAtPrice
//         });
//       }
//     });

//     const fields = ['name', 'title', 'variantSubModel', 'price', 'compareAtPrice'];
//     const json2csvParser = new Parser({ fields });
//     const csv = json2csvParser.parse(flatProducts);

//     const filePath = path.join(__dirname, 'products_export.csv');
//     fs.writeFileSync(filePath, '\uFEFF' + csv, { encoding: 'utf8' }); // כולל BOM ל־Excel בעברית

//     console.log('✅ Export completed to', filePath);
//     process.exit();
//   } catch (err) {
//     console.error('❌ Error:', err);

//   }
// })();



const mongoose = require('mongoose');


// const MetaCapiService = require("../services/MetaCapiService")

//     const meta = new MetaCapiService({
//       pixelId: "2511924365726545",
//       accessToken: "EAAGBr1hwWqABPulIlfckDrfsW84ZB8DJ6vTZBHKx13FtDca611q3uo1jn6fn5X1Lu9NAZCaLoqF7SVpTiCGRKcPstkznIPtlYqlH8S1y2r8mVozQgIj9RcVg6CACjI5L0tj7QTipMRPVzIWlIZB7LPAWM9EtENPyqLYmGAz3LcHSs68dV5wq9ZAHeP5hAigZDZD",
//     });

// (async () => {
//   try {
//     const response = await meta.sendPurchase({
//       value: 120.99,
//       currency: "USD",
//       email: "test@example.com",
//       phone: "+972501234567",
//       url: "https://example.com/checkout/success",
//     });

//     console.log("✅ Test successful, response:");
//     console.log(JSON.stringify(response, null, 2));
//   } catch (error) {
//     console.error("❌ Test failed:", error.message);
//   }
// })();









const SCHEMA_UPDATES = {

  "ox-dubai": {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Inokim OX Dubai",
    "alternateName": "אינוקים OX דובאי",
    "description": "Inokim OX Dubai הוא קורקינט חשמלי פרימיום עם GPS מובנה, פתיחה חכמה באמצעות NFC, אזעקה ושלט חכם. כולל סוללה 60V 21Ah, טווח נסיעה עד 60 ק\"מ ובלמים הידראוליים.",
    "image": "https://il.inokim.com/optimized/newOx/colors.png",
    "url": "https://il.inokim.com/products/ox-dubai",
    "brand": { "@type": "Brand", "name": "Inokim" },
    "manufacturer": { "@type": "Organization", "name": "Inokim", "url": "https://il.inokim.com" },
    "sku": "OX-DUBAI-60V-21AH",
    "category": "קורקינטים חשמליים פרימיום",
    "offers": {
      "@type": "Offer",
      "url": "https://il.inokim.com/products/ox-dubai",
      "priceCurrency": "ILS",
      "price": "8490",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@type": "Organization", "name": "אינוקים ישראל", "url": "https://il.inokim.com" }
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "סוללה", "value": "60V 21Ah / 48V 21Ah" },
      { "@type": "PropertyValue", "name": "טווח נסיעה", "value": "עד 60 ק\"מ" },
      { "@type": "PropertyValue", "name": "מהירות מקסימלית", "value": "25 קמ\"ש" },
      { "@type": "PropertyValue", "name": "GPS", "value": "מובנה באפליקציה" },
      { "@type": "PropertyValue", "name": "פתיחה חכמה", "value": "NFC מאובטח" },
      { "@type": "PropertyValue", "name": "אבטחה", "value": "אזעקה + שלט חכם" },
      { "@type": "PropertyValue", "name": "בלמים", "value": "הידראוליים קדמי ואחורי" },
      { "@type": "PropertyValue", "name": "צמיגים", "value": "פנומטיים 10 אינץ'" }
    ]
  },

  "inokim-kix": {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Inokim KIX",
    "alternateName": "אינוקים קיקס",
    "description": "Inokim KIX – קורקינט חשמלי דור חדש עם משקל 16 ק\"ג בלבד, טווח נסיעה עד 40 ק\"מ וטעינה מהירה ב-3 שעות. כולל מערכת שיכוך כפול ובלמים כפולים.",
    "image": "https://il.inokim.com/optimized/kix-og.png",
    "url": "https://il.inokim.com/products/inokim-kix",
    "brand": { "@type": "Brand", "name": "Inokim" },
    "manufacturer": { "@type": "Organization", "name": "Inokim", "url": "https://il.inokim.com" },
    "sku": "INSKIX010101",
    "category": "קורקינטים חשמליים עירוניים",
    "offers": {
      "@type": "Offer",
      "url": "https://il.inokim.com/products/inokim-kix",
      "priceCurrency": "ILS",
      "price": "3990",
      "priceValidUntil": "2027-03-31",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@type": "Organization", "name": "אינוקים ישראל", "url": "https://il.inokim.com" }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "85"
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "משקל עצמי", "value": "16 ק\"ג" },
      { "@type": "PropertyValue", "name": "טווח נסיעה", "value": "עד 40 ק\"מ" },
      { "@type": "PropertyValue", "name": "זמן טעינה", "value": "3 שעות" },
      { "@type": "PropertyValue", "name": "מערכת שיכוך", "value": "כפולה (Dual Suspension)" },
      { "@type": "PropertyValue", "name": "סוג בלמים", "value": "בלימה כפולה מדויקת" },
      { "@type": "PropertyValue", "name": "משקל נשיאה", "value": "100 ק\"ג" },
      { "@type": "PropertyValue", "name": "תצוגה", "value": "LCD Display" }
    ]
  },

  "ox-carbon": {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Inokim OX Carbon",
    "alternateName": "אינוקים OX קרבון",
    "description": "Inokim OX Carbon – קורקינט חשמלי עוצמתי עם מסגרת קרבון קלה ועמידה. סוללה 60V 21Ah, ביצועים גבוהים וטווח ארוך לרכיבה עירונית ושטח.",
    "image": "https://d3kxrpm9y5cv3a.cloudfront.net/optimized/oxOverview.png",
    "url": "https://il.inokim.com/products/ox-carbon",
    "brand": { "@type": "Brand", "name": "Inokim" },
    "manufacturer": { "@type": "Organization", "name": "Inokim", "url": "https://il.inokim.com" },
    "sku": "OX-CARBON-60V-21AH",
    "material": "Carbon fiber, aerospace aluminum alloy",
    "category": "קורקינטים חשמליים פרימיום",
    "offers": {
      "@type": "Offer",
      "url": "https://il.inokim.com/products/ox-carbon",
      "priceCurrency": "ILS",
      "price": "6900",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@type": "Organization", "name": "אינוקים ישראל", "url": "https://il.inokim.com" }
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "סוללה", "value": "60V 21Ah" },
      { "@type": "PropertyValue", "name": "חומר מסגרת", "value": "קרבון + אלומיניום תעשיית אווירית" },
      { "@type": "PropertyValue", "name": "עומס מרבי", "value": "120 ק\"ג" }
    ]
  },

  "/products/inokim-ox-white": {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Inokim OX White",
    "alternateName": "אינוקים OX לבן",
    "description": "Inokim OX White – גרסת Limited Edition לבנה של סדרת ה-OX. הדגם המתקדם ביותר של אינוקים עם סוללות 60V 21Ah ו-48V 21Ah.",
    "image": "https://d3kxrpm9y5cv3a.cloudfront.net/optimized/overviewWhite.webp",
    "url": "https://il.inokim.com/products/inokim-ox-white",
    "brand": { "@type": "Brand", "name": "Inokim" },
    "manufacturer": { "@type": "Organization", "name": "Inokim", "url": "https://il.inokim.com" },
    "sku": "OX-WHITE-60V-21AH",
    "color": "לבן",
    "category": "קורקינטים חשמליים פרימיום",
    "offers": [
      {
        "@type": "Offer",
        "name": "OX White 60V 21Ah",
        "url": "https://il.inokim.com/products/inokim-ox-white",
        "priceCurrency": "ILS",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@type": "Organization", "name": "אינוקים ישראל" }
      },
      {
        "@type": "Offer",
        "name": "OX White 48V 21Ah",
        "url": "https://il.inokim.com/products/inokim-ox-white",
        "priceCurrency": "ILS",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@type": "Organization", "name": "אינוקים ישראל" }
      }
    ],
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "גרסאות", "value": "60V 21Ah / 48V 21Ah" },
      { "@type": "PropertyValue", "name": "זמינות 60V", "value": "14 ימי עסקים" },
      { "@type": "PropertyValue", "name": "זמינות 48V", "value": "5 ימי עסקים" },
      { "@type": "PropertyValue", "name": "עומס מרבי", "value": "120 ק\"ג" }
    ]
  },

  "/products/inokim-ox-land-surfer": {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Inokim OX Land Surfer",
    "alternateName": "אינוקים OX לנדסרפר",
    "description": "Inokim OX Land Surfer – קורקינט שטח ואורבן עם צמיגים רחבים. סוללות 60V 21Ah ו-48V 21Ah, זמינות מהירה של 2 ימי עסקים.",
    "image": "https://d3kxrpm9y5cv3a.cloudfront.net/optimized/shop.webp",
    "url": "https://il.inokim.com/products/inokim-ox-land-surfer",
    "brand": { "@type": "Brand", "name": "Inokim" },
    "manufacturer": { "@type": "Organization", "name": "Inokim", "url": "https://il.inokim.com" },
    "sku": "OX-LANDSURFER-60V-21AH",
    "category": "קורקינטים חשמליים שטח",
    "offers": [
      {
        "@type": "Offer",
        "name": "OX Land Surfer 60V 21Ah",
        "url": "https://il.inokim.com/products/inokim-ox-land-surfer",
        "priceCurrency": "ILS",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@type": "Organization", "name": "אינוקים ישראל" }
      },
      {
        "@type": "Offer",
        "name": "OX Land Surfer 48V 21Ah",
        "url": "https://il.inokim.com/products/inokim-ox-land-surfer",
        "priceCurrency": "ILS",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@type": "Organization", "name": "אינוקים ישראל" }
      }
    ],
    "video": {
      "@type": "VideoObject",
      "name": "Inokim OX Land Surfer – וידאו הדגמה",
      "description": "OX Land Surfer – קורקינט שטח ואורבן עוצמתי מבית Inokim",
      "thumbnailUrl": "https://d3kxrpm9y5cv3a.cloudfront.net/optimized/shop.webp",
      "contentUrl": "https://il.inokim.com/videos/ox_video.mp4",
      "uploadDate": "2025-03-12T12:00:00Z"
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "גרסאות", "value": "60V 21Ah / 48V 21Ah" },
      { "@type": "PropertyValue", "name": "זמינות", "value": "2 ימי עסקים" },
      { "@type": "PropertyValue", "name": "צמיגים", "value": "רחבים לשטח ואורבן" }
    ]
  },

  "/products/light-2-0": {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Inokim Light 2",
    "alternateName": ["אינוקים לייט 2", "Light 2.0"],
    "description": "Inokim Light 2 – קורקינט חשמלי קל ומתקפל לנסיעות עירוניות. עוצב עבור הרוכב המחפש איכות נסיעה עם קיפול נוח לאחסון בתחבורה ציבורית, ברכב ובמשרד.",
    "image": "https://d3kxrpm9y5cv3a.cloudfront.net/optimized/light2Overview.webp",
    "url": "https://il.inokim.com/products/light-2-0",
    "brand": { "@type": "Brand", "name": "Inokim" },
    "manufacturer": { "@type": "Organization", "name": "Inokim", "url": "https://il.inokim.com" },
    "sku": "LIGHT2-36V-136AH",
    "category": "קורקינטים חשמליים עירוניים",
    "offers": {
      "@type": "Offer",
      "url": "https://il.inokim.com/products/light-2-0",
      "priceCurrency": "ILS",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@type": "Organization", "name": "אינוקים ישראל", "url": "https://il.inokim.com" }
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "סוללה", "value": "36V 13.6Ah" },
      { "@type": "PropertyValue", "name": "זמן אספקה", "value": "7 ימי עסקים" },
      { "@type": "PropertyValue", "name": "תקן בטיחות", "value": "SGS certified UL 2272" },
      { "@type": "PropertyValue", "name": "מאפיין", "value": "קל, מתקפל, אידיאלי לתחבורה משולבת" }
    ]
  },

  "inokim-quick-4": {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Inokim Quick 4",
    "alternateName": ["אינוקים קוויק 4", "Quick 4 2025"],
    "description": "Inokim Quick 4 – קורקינט חשמלי עם סוללה 52V 16Ah, טווח נסיעה עד 50 ק\"מ, בלמי תוף קדמי ואחורי וצמיגים פנומטיים 10 אינץ'. אידיאלי לנסיעות יומיומיות.",
    "image": "https://d3kxrpm9y5cv3a.cloudfront.net/optimized/quick4.webp",
    "url": "https://il.inokim.com/products/inokim-quick-4",
    "brand": { "@type": "Brand", "name": "Inokim" },
    "manufacturer": { "@type": "Organization", "name": "Inokim", "url": "https://il.inokim.com" },
    "sku": "QUICK4-52V-16AH",
    "category": "קורקינטים חשמליים",
    "offers": {
      "@type": "Offer",
      "url": "https://il.inokim.com/products/inokim-quick-4",
      "priceCurrency": "ILS",
      "price": "5500",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@type": "Organization", "name": "אינוקים ישראל", "url": "https://il.inokim.com" }
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "סוללה", "value": "52V 16Ah" },
      { "@type": "PropertyValue", "name": "טווח נסיעה", "value": "עד 50 ק\"מ" },
      { "@type": "PropertyValue", "name": "מהירות מקסימלית", "value": "40 קמ\"ש" },
      { "@type": "PropertyValue", "name": "בלמים", "value": "ברקס תוף קדמי ואחורי" },
      { "@type": "PropertyValue", "name": "צמיגים", "value": "פנומטיים 10 אינץ'" },
      { "@type": "PropertyValue", "name": "תאורה", "value": "תאורת לד קדמית ואחורית" },
      { "@type": "PropertyValue", "name": "עומס מרבי", "value": "80 ק\"ג" }
    ]
  },

  "find-us": {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Inokim – אינוקים ישראל",
    "description": "רשת נקודות מכירה ושירות מורשות לקורקינטים חשמליים של Inokim ברחבי ישראל.",
    "url": "https://il.inokim.com/find-us",
    "logo": "https://il.inokim.com/optimized/logo.svg",
    "image": "https://d3kxrpm9y5cv3a.cloudfront.net/optimized/og-find-us.jpg",
    "telephone": "+972-3-9105090",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "המסגר 10",
      "addressLocality": "תל אביב",
      "postalCode": "6473409",
      "addressCountry": "IL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "32.069023",
      "longitude": "34.794070"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        "opens": "09:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Friday",
        "opens": "09:00",
        "closes": "13:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/inokimisrael",
      "https://www.instagram.com/inokim_israel"
    ]
  },

  "support": {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "תמיכה טכנית – Inokim",
    "description": "מדריכים וסרטוני וידאו רשמיים לתפעול, תחזוקה ושימוש נכון בדגמי הקורקינטים החשמליים של Inokim.",
    "url": "https://il.inokim.com/support",
    "publisher": {
      "@type": "Organization",
      "name": "Inokim",
      "url": "https://il.inokim.com",
      "logo": "https://il.inokim.com/optimized/logo.svg",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+972-3-9105090",
        "contactType": "technical support",
        "areaServed": "IL",
        "availableLanguage": ["Hebrew", "English"]
      }
    }
  },

  "test-ride": {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "נסיעת מבחן לקורקינט חשמלי אינוקים",
    "description": "הזמינו נסיעת מבחן באחת מהנקודות המורשות של Inokim ותחוו את הדגמים המובילים מקרוב לפני הרכישה.",
    "url": "https://il.inokim.com/test-ride",
    "serviceType": "Test Ride – ניסוי קורקינט לפני רכישה",
    "provider": {
      "@type": "Organization",
      "name": "Inokim Israel",
      "url": "https://il.inokim.com",
      "logo": "https://il.inokim.com/optimized/logo.svg",
      "telephone": "+972-3-9105090"
    },
    "areaServed": { "@type": "Country", "name": "ישראל" },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "ILS",
      "description": "נסיעת מבחן ללא עלות",
      "availability": "https://schema.org/InStock"
    },
    "image": "https://d3kxrpm9y5cv3a.cloudfront.net/optimized/og-test-ride.jpg"
  },

};

// ─── Runner ──────────────────────────────────────────────────────────────────

/**
 * updateSchemas.js
 * One-time script to update all jsonLd schemas in MongoDB for il.inokim.com
 *
 * Usage:
 *   MONGO_URI=mongodb+srv://... node updateSchemas.js
 *   or just: node updateSchemas.js  (if MONGO_URI is in your .env)
 */



// ─── Runner ──────────────────────────────────────────────────────────────────

async function run() {


  const handles = Object.keys(SCHEMA_UPDATES);
  // console.log(`\n📋  Updating ${handles.length} pages...\n`);

  const results = { updated: [], notFound: [], errors: [] };

  for (const handle of handles) {
    try {
      // urlHandle is stored both with and without a leading slash in your DB
      const doc = await Seo.findOneAndUpdate(
        { urlHandle: { $in: [handle, `/${handle}`] } },
        { $set: { jsonLd: SCHEMA_UPDATES[handle] } },
        { new: true }
      );

      if (!doc) {
        results.notFound.push(handle);
        console.warn(`  ⚠️  Not found:  ${handle}`);
      } else {
        results.updated.push(handle);
        // console.log(`  ✅  Updated:    ${handle}  →  "${doc.pageTitle}"`);
      }
    } catch (err) {
      results.errors.push({ handle, err: err.message });
      console.error(`  ❌  Error on ${handle}: ${err.message}`);
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────");
  console.log(`  ✅  Updated:   ${results.updated.length}`);
  console.log(`  ⚠️   Not found: ${results.notFound.length}`);
  console.log(`  ❌  Errors:    ${results.errors.length}`);
  if (results.notFound.length)
    console.log("\n  Not found handles:", results.notFound);
  if (results.errors.length)
    console.log("\n  Errors:", results.errors);
  console.log("─────────────────────────────────────\n");

}

// run().catch((err) => {
//   console.error("Fatal:", err);

// });




async function generateFaqForScooters() {
  try {
    const products = await Product.find({
      templateType: { $in: ['dubai', 'scooter', 'kix'] },
      status: 'active'
    });

    console.log(`Found ${products.length} scooter products`);

    for (const product of products) {
      const faq = [];

      // -------------------------
      // 1. שאלות כלליות (קבועות)
      // -------------------------
      faq.push(
        {
          question: `האם ${product.name} מתאים לנסיעות יומיומיות?`,
          answer: `${product.name} מתאים מאוד לנסיעות יומיומיות בעיר, עם נוחות גבוהה ויציבות גם בדרכים משתנות.`,
          order: 1
        },
        {
          question: `האם ${product.name} חוקי לשימוש בישראל?`,
          answer: `כן, הדגם עומד בתקנות בישראל בהתאם למפרט היצרן.`,
          order: 2
        },
        {
          question: `כמה זמן לוקח לטעון את ${product.name}?`,
          answer: `זמן טעינה ממוצע נע בין 5 ל-8 שעות, בהתאם לדגם ולסוללה.`,
          order: 3
        }
      );

      // -------------------------
      // 2. מידע מה־variants
      // -------------------------
      const variant = product.variants?.[0];

      if (variant) {
        if (variant.range) {
          faq.push({
            question: `מה הטווח נסיעה של ${product.name}?`,
            answer: `הטווח של ${product.name} מגיע עד ${variant.range}, תלוי בתנאי הדרך ומשקל הרוכב.`,
            order: 4
          });
        }

        if (variant.battary) {
          faq.push({
            question: `איזו סוללה יש ל-${product.name}?`,
            answer: `${product.name} מגיע עם סוללה מסוג ${variant.battary}, המספקת ביצועים גבוהים לאורך זמן.`,
            order: 5
          });
        }
      }

      // -------------------------
      // 3. מידע מתוך specs
      // -------------------------
      if (product.specs && product.specs.length > 0) {
        product.specs.forEach(cat => {
          cat.items.forEach(item => {
            if (item.label && item.value) {
              faq.push({
                question: ` מה ה${item.label} של ${product.name}?`,
                answer: `${item.label} של ${product.name} הוא ${item.value}.`,
                order: faq.length + 1
              });
            }
          });
        });
      }

      // -------------------------
      // 4. overview / description
      // -------------------------
      if (product.description) {
        faq.push({
          question: `מה היתרונות של ${product.name}?`,
          answer: product.description.slice(0, 200),
          order: faq.length + 1
        });
      }

      // -------------------------
      // 5. fallback smart questions
      // -------------------------
      faq.push(
        {
          question: `למי מתאים ${product.name}?`,
          answer: `${product.title} מתאים לרוכבים שמחפשים שילוב של נוחות, ביצועים ואמינות לשימוש יומיומי.`,
          order: faq.length + 1
        },
        {
          question: `מה ההבדל בין ${product.name} לדגמים אחרים?`,
          answer: `${product.title} מציע איזון ייחודי בין טווח נסיעה, איכות בנייה ונוחות רכיבה.`,
          order: faq.length + 1
        }
      );

      // -------------------------
      // 6. ניקוי כפילויות
      // -------------------------
      const uniqueFaq = [];
      const seen = new Set();

      for (const item of faq) {
        if (!seen.has(item.question)) {
          seen.add(item.question);
          uniqueFaq.push(item);
        }
      }

      // -------------------------
      // 7. שמירה
      // -------------------------
      product.faq = uniqueFaq.slice(0, 10); // מגביל ל-10 שאלות (SEO best practice)
    await Product.updateOne(
  { _id: product._id },
  { $set: { faq: uniqueFaq.slice(0, 10) } },
  { runValidators: false }
);

      console.log(`✅ FAQ generated for: ${product.title}`);
    }

    console.log('🚀 Done generating FAQ for all scooters');
  } catch (err) {
    console.error('❌ Error generating FAQ:', err);
  }
}


// (async () => {
//   await generateFaqForScooters();

// })();



const Coupon = require('../models/Coupon'); 


const PRODUCT_ID = '67c733d44fbf971510b33b63';
const TOTAL_COUPONS = 120;
const CODE_LENGTH = 10;

function generateCode(length = CODE_LENGTH) {
  if (length < 8 || length > 16) {
    throw new Error('Code length must be between 8 and 16 digits');
  }

  const firstDigit = '123456789';
  const otherDigits = '0123456789';

  let code = firstDigit.charAt(Math.floor(Math.random() * firstDigit.length));

  for (let i = 1; i < length; i++) {
    code += otherDigits.charAt(Math.floor(Math.random() * otherDigits.length));
  }

  return code;
}

async function generateCoupons() {
  const coupons = [];
  const usedCodes = new Set();

  while (coupons.length < TOTAL_COUPONS) {
    const code = generateCode();

    if (usedCodes.has(code)) continue;
    usedCodes.add(code);

    coupons.push({
      code,
      type: 'percentage',
      discountValue: 100,
      applicableProducts: [PRODUCT_ID],
      usageLimit: 1,
      usedCount: 0,
      expirationDate: new Date('2026-12-31'),
      active: true,
    });
  }

  try {
    await Coupon.insertMany(coupons, { ordered: false });
    console.log(`Created ${coupons.length} coupons`);
  } catch (err) {
    console.log('Some duplicates skipped', err.message);
  }
}

// generateCoupons();


const ExcelJS = require('exceljs');

async function exportCouponsToExcel() {
  try {
    const coupons = await Coupon.find({ applicableProducts: '67c733d44fbf971510b33b63' });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Coupons');

    worksheet.columns = [
      { header: 'Code', key: 'code', width: 20 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Discount Value', key: 'discountValue', width: 15 },
      { header: 'Expiration Date', key: 'expirationDate', width: 20 },
      { header: 'Active', key: 'active', width: 10 }
    ];

    coupons.forEach(coupon => {
      worksheet.addRow({
        code: coupon.code,
        type: coupon.type,
        discountValue: coupon.discountValue,
        expirationDate: coupon.expirationDate.toLocaleDateString(),
        active: coupon.active
      });
    });

    await workbook.xlsx.writeFile('Inokim_Coupons.xlsx');
    console.log('Excel file created successfully!');
    
  } catch (error) {
    console.error('Error exporting coupons:', error);
  }
}

// exportCouponsToExcel();


// const ExcelJS = require('exceljs');
// const path = require('path');
// const fs = require('fs');


exportOrdersToExcel = async () => {
  try {
    const orders = await Order.find()
      .populate('userId')
      .populate('coupon')
      .sort({createdAt: -1})
      .lean();

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Inokim';
    workbook.created = new Date();

    /*
     |--------------------------------------------------------------------------
     | ORDERS SHEET
     |--------------------------------------------------------------------------
     */

    const ordersSheet = workbook.addWorksheet('Orders');

    ordersSheet.columns = [
      {header: 'Order ID', key: 'orderId', width: 32},
      {header: 'Session ID', key: 'sessionId', width: 35},

      {header: 'Created At', key: 'createdAt', width: 24},
      {header: 'Updated At', key: 'updatedAt', width: 24},

      {header: 'Total Price', key: 'totalPrice', width: 15},
      {header: 'Discount', key: 'discount', width: 15},
      {header: 'Shipping Cost', key: 'shippingCost', width: 15},

      {header: 'Payment Type', key: 'paymentType', width: 20},
      {header: 'Payment Status', key: 'paymentStatus', width: 20},
      {header: 'Order Status', key: 'orderStatus', width: 20},

      {header: 'Transaction ID', key: 'transactionId', width: 35},
      {
        header: 'Gateway Transaction ID',
        key: 'paymentGatewayTransactionId',
        width: 35,
      },

      {header: 'Payment Link', key: 'paymentLink', width: 50},

      {header: 'Coupon Code', key: 'couponCode', width: 20},
      {header: 'Coupon ID', key: 'couponId', width: 32},

      {header: 'Newsletter', key: 'newsletter', width: 12},
      {header: 'Lead Sent', key: 'isLeadSent', width: 12},

      {header: 'Customer First Name', key: 'firstName', width: 20},
      {header: 'Customer Last Name', key: 'lastName', width: 20},
      {header: 'Customer Email', key: 'email', width: 30},
      {header: 'Customer Phone', key: 'phone', width: 20},

      {header: 'Shipping Method', key: 'shippingMethod', width: 20},

      {header: 'City', key: 'city', width: 20},
      {header: 'Address', key: 'address', width: 30},
      {header: 'Address Num', key: 'addressNum', width: 15},
      {header: 'Home Num', key: 'homeNum', width: 15},
      {header: 'Floor', key: 'homeFloor', width: 15},
      {header: 'Entrance', key: 'homeEntrance', width: 15},
      {header: 'Entrance Code', key: 'homeEntranceCode', width: 18},

      {header: 'Hotel Name', key: 'hotelName', width: 25},
      {header: 'Arrival Date', key: 'arrivalDate', width: 20},

      {header: 'Notes', key: 'notes', width: 40},

      {header: 'Fulfilled From', key: 'fulfilledFrom', width: 20},

      {
        header: 'Last Status Modified',
        key: 'lastStatusModifiedDate',
        width: 25,
      },
    ];

    /*
     |--------------------------------------------------------------------------
     | ITEMS SHEET
     |--------------------------------------------------------------------------
     */

    const itemsSheet = workbook.addWorksheet('Order Items');

    itemsSheet.columns = [
      {header: 'Order ID', key: 'orderId', width: 32},
      {header: 'Session ID', key: 'sessionId', width: 35},

      {header: 'Product Name', key: 'prdName', width: 40},
      {header: 'Variant ID', key: 'variantId', width: 32},
      {header: 'SKU', key: 'sku', width: 20},

      {header: 'Serial Number', key: 'serialNumber', width: 25},

      {header: 'Color Name', key: 'colorName', width: 20},
      {header: 'Color Hex', key: 'colorHex', width: 15},

      {header: 'Quantity', key: 'quantity', width: 12},

      {header: 'Price', key: 'price', width: 15},
      {header: 'Compare At Price', key: 'compareAtPrice', width: 18},

      {header: 'Availability', key: 'availability', width: 18},

      {header: 'Image', key: 'img', width: 50},
    ];

    /*
     |--------------------------------------------------------------------------
     | TRANSACTIONS SHEET
     |--------------------------------------------------------------------------
     */

    const transactionsSheet = workbook.addWorksheet('Transactions');

    transactionsSheet.columns = [
      {header: 'Order ID', key: 'orderId', width: 32},

      {header: 'Type', key: 'type', width: 20},
      {header: 'Amount', key: 'amount', width: 15},

      {header: 'Approval Number', key: 'approval_num', width: 25},
      {header: 'Voucher Number', key: 'voucher_num', width: 25},
      {header: 'Last 4 Digits', key: 'four_digits', width: 18},

      {header: 'Expiry Month', key: 'expiry_month', width: 15},
      {header: 'Expiry Year', key: 'expiry_year', width: 15},

      {header: 'Issuer Name', key: 'issuer_name', width: 25},

      {
        header: 'Number Of Payments',
        key: 'number_of_payments',
        width: 20,
      },

      {
        header: 'First Payment Amount',
        key: 'first_payment_amount',
        width: 22,
      },

      {
        header: 'Rest Payments Amount',
        key: 'rest_payments_amount',
        width: 22,
      },

      {header: 'Transaction Date', key: 'transactionDate', width: 24},

      {header: 'Message', key: 'message', width: 40},
    ];

    /*
     |--------------------------------------------------------------------------
     | DATA INSERTION
     |--------------------------------------------------------------------------
     */

    for (const order of orders) {
      ordersSheet.addRow({
        orderId: order._id?.toString(),
        sessionId: order.sessionId,

        createdAt: order.createdAt,
        updatedAt: order.updatedAt,

        totalPrice: order.totalPrice,
        discount: order.discount,
        shippingCost: order.shippingCost,

        paymentType: order.paymentType,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,

        transactionId: order.transactionId,
        paymentGatewayTransactionId:
          order.paymentGatewayTransactionId,

        paymentLink: order.paymentLink,

        couponCode: order.coupon?.code || '',
        couponId: order.coupon?._id?.toString() || '',

        newsletter: order.newsletter ? 'Yes' : 'No',
        isLeadSent: order.isLeadSent ? 'Yes' : 'No',

        firstName: order.contactInfo?.firstName,
        lastName: order.contactInfo?.lastName,
        email: order.contactInfo?.email,
        phone: order.contactInfo?.phone,

        shippingMethod: order.shippingMethod,

        city: order.shippingAddress?.city,
        address: order.shippingAddress?.address,
        addressNum: order.shippingAddress?.addressNum,
        homeNum: order.shippingAddress?.homeNum,
        homeFloor: order.shippingAddress?.homeFloor,
        homeEntrance: order.shippingAddress?.homeEntrance,
        homeEntranceCode:
          order.shippingAddress?.homeEntranceCode,

        hotelName: order.shippingAddress?.hotelName,

        arrivalDate: order.shippingAddress?.arrivalDate,

        notes: order.notes,

        fulfilledFrom: order.fulfilledFrom,

        lastStatusModifiedDate:
          order.lastStatusModifiedDate,
      });

      /*
       |--------------------------------------------------------------------------
       | ITEMS
       |--------------------------------------------------------------------------
       */

      for (const item of order.items || []) {
        itemsSheet.addRow({
          orderId: order._id?.toString(),
          sessionId: order.sessionId,

          prdName: item.prdName,
          variantId: item.variantId?.toString(),

          sku: item.sku,

          serialNumber: item.serialNumber,

          colorName: item.color?.name,
          colorHex: item.color?.hex,

          quantity: item.quantity,

          price: item.price,
          compareAtPrice: item.compareAtPrice,

          availability: item.availability,

          img: item.img,
        });
      }

      /*
       |--------------------------------------------------------------------------
       | TRANSACTIONS
       |--------------------------------------------------------------------------
       */

      for (const transaction of order.transactions || []) {
        transactionsSheet.addRow({
          orderId: order._id?.toString(),

          type: transaction.type,
          amount: transaction.amount,

          approval_num:
            transaction.cardDetails?.approval_num,

          voucher_num:
            transaction.cardDetails?.voucher_num,

          four_digits:
            transaction.cardDetails?.four_digits,

          expiry_month:
            transaction.cardDetails?.expiry_month,

          expiry_year:
            transaction.cardDetails?.expiry_year,

          issuer_name:
            transaction.cardDetails?.issuer_name,

          number_of_payments:
            transaction.cardDetails?.number_of_payments,

          first_payment_amount:
            transaction.cardDetails?.first_payment_amount,

          rest_payments_amount:
            transaction.cardDetails?.rest_payments_amount,

          transactionDate: transaction.transactionDate,

          message: transaction.message,
        });
      }
    }

    /*
     |--------------------------------------------------------------------------
     | STYLING
     |--------------------------------------------------------------------------
     */

    [ordersSheet, itemsSheet, transactionsSheet].forEach((sheet) => {
      sheet.getRow(1).font = {
        bold: true,
      };

      sheet.getRow(1).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };

      sheet.views = [
        {
          state: 'frozen',
          ySplit: 1,
        },
      ];
    });

    /*
     |--------------------------------------------------------------------------
     | EXPORT
     |--------------------------------------------------------------------------
     */

    const exportDir = path.join(__dirname, '../exports');

    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    const filePath = path.join(
      exportDir,
      `orders-export-${Date.now()}.xlsx`,
    );

    await workbook.xlsx.writeFile(filePath);

    console.log('✅ Orders Excel exported:', filePath);

    return filePath;
  } catch (err) {
    console.error('❌ Failed exporting orders:', err);
    throw err;
  }
};


// exportOrdersToExcel()