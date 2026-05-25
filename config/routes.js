

const viewsRoute = require('../routes/viewsRoute');
const couponRoute = require('../routes/couponRoutes');
const productRoutes = require('../routes/productsRoutes');
const cartRoutes = require('../routes/cartRoutes');
const categoryRoutes = require('../routes/categoryRoutes');
const seoRoutes = require('../routes/seoRoutes');
const pageRoutes = require('../routes/pageRoutes');
const locationRoutes = require('../routes/locationRoutes');
const contactFormRoutes = require('../routes/contactFormRoutes');
const blogRoutes = require('../routes/blogRoutes');
const userRoutes = require('../routes/userRoutes');
const orderRoutes = require('../routes/orderRoutes');
const authRoutes = require('../routes/authRoutes');
const upsellRoutes = require('../routes/upsellRoutes');
const shippingRoutes = require('../routes/shippingRoutes');
const videoSupportRoutes = require('../routes/videoSupportRoutes');
const trackerRoutes = require('../routes/trackerRoutes');
const redirectsRoute = require('../routes/redirectRoutes');
const settingsRoutes = require('../routes/settingsRoutes');
const adminRoutes = require('../routes/adminRoutes');
const sitemapRoutes = require('../routes/sitemapRoutes');
const adsRoutes = require('../routes/adsRoutes')
const homePageRoutes = require('../routes/homePgaeRoutes')
const footerRoutes = require('../routes/footerRoutes')
const abTestRoutes = require('../routes/abTestRoutes')
const vatModeRoutes = require('../routes/vatModeRoutes');


module.exports = {
  viewsRoute,
  adminRoutes,
  sitemapRoutes,
  apiRoutes: {
    "coupon": couponRoute,
    "product": productRoutes,
    "carts": cartRoutes,
    "category": categoryRoutes,
    "seo": seoRoutes,
    "pages": pageRoutes,
    "location": locationRoutes,
    "contact": contactFormRoutes,  // 🔹 Fixed path
    "blog": blogRoutes,
    "users": userRoutes,
    "orders": orderRoutes,
    "upsell": upsellRoutes,
    "shipping": shippingRoutes,
    "video-support": videoSupportRoutes, // 🔹 Fixed path
    "tracker": trackerRoutes,
    "redirect": redirectsRoute,
    "setting": settingsRoutes,
    "ads": adsRoutes,
    "home": homePageRoutes,
    "footer": footerRoutes,
    "ab-test": abTestRoutes,
    "": authRoutes, 
    "vat-mode": vatModeRoutes
  }
};
