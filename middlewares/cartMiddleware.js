const Cart = require('../models/Cart'); 

exports.attachCart = async (req, res, next) => {
  try {
    const sessionId = req.sessionID;

    if (sessionId) {
      const cart = await Cart.findOne({ sessionId }).populate('coupon').lean();
      
      req.cart = cart;
      res.locals.cart = cart;
    } else {
      req.cart = null;
      res.locals.cart = null;
    }
  } catch (error) {
    console.error("Error attaching cart globally:", error);
    req.cart = null;
    res.locals.cart = null;
  }
  
  next();
};