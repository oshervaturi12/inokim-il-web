const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');



// Redirect to Google for authentication
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));



router.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }), // Disable Passport session if not using sessions
    (req, res) => {
      const user = req.user;
  
      // Issue JWT just like your existing login
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });
  
      res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
  
      res.redirect('/'); // ✅ Redirect to wherever you want after login
    }
  );

module.exports = router;