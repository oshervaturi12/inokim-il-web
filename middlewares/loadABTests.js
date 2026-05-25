// // middleware/loadABTests.js
const ABTest = require('../models/ABTests');
const { assignVariant } = require('../util/abTestUtils');




module.exports = async (req, res, next) => {
  const abTests = await ABTest.find({ isActive: true }).lean();
  res.locals.abTests = {};

  abTests.forEach(test => {
    const sessionKey = `abtest:${test.key}`;
    const force = req.query.forceAB === 'true'; // allow override

    if (!test.allowRepeat && req.session[sessionKey] && !force) {
      res.locals.abTests[test.key] = req.session[sessionKey];
    } else {
      const variant = assignVariant(test.variants);

      // Normalize structure and store
      const assigned = {
        name: variant.name,
        key: variant.name, // Add key for compatibility
        content: variant.content
      };

      req.session[sessionKey] = assigned;
      res.locals.abTests[test.key] = assigned;
    }
  });

  next();
};
