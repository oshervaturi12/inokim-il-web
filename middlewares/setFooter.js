const FooterSection = require('../models/FooterSectionSchema');
const { getCache, setCache } = require('../util/cacheManager');
const CACHE_KEY = 'footer:sections';

module.exports = async (req, res, next) => {
  if (req.originalUrl.startsWith('/admin')) return next();

  try {
    const cachedData = await getCache(CACHE_KEY);
    if (cachedData) {
      res.locals.footerSections = cachedData;
      return next();
    }

    const sections = await FooterSection.find().sort({ order: 1 }).lean();
    const footerData = sections[0] || [];

    await setCache(CACHE_KEY, footerData);
    res.locals.footerSections = footerData;

    next();
  } catch (err) {
    console.error('❌ Error in loadFooter middleware:', err);
    res.locals.footerSections = [];
    next();
  }
};