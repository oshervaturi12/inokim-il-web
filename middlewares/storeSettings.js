

const Settings = require('../models/Settings');
const { getCache, setCache } = require('../util/cacheManager');
const CACHE_KEY = 'store:settings';

module.exports = async (req, res, next) => {
  try {
    const cachedSettings = await getCache(CACHE_KEY);
    if (cachedSettings) {
      res.locals.storeSettings = cachedSettings;
      return next();
    }

    const settings = await Settings.findOne().lean();
    await setCache(CACHE_KEY, settings || {});
    res.locals.storeSettings = settings || {};

    next();
  } catch (err) {
    console.error("❌ Error loading store settings:", err);
    res.locals.storeSettings = {};
    next();
  }
};