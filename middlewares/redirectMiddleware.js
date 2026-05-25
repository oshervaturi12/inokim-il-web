const Redirect = require('../models/Redirect');

module.exports = async (req, res, next) => {
  try {
    const redirect = await Redirect.findOne({ from: req.path });

    if (redirect) {
      return res.redirect(redirect.isPermanent ? 301 : 302, redirect.to);
    }

    next();
  } catch (error) {
    console.error("⚠️ Redirect Middleware Error:", error);
    next(); // Continue to the next middleware even if there's an error
  }
};
