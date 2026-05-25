

const express = require('express');
const path = require('path');
const passport = require('passport');
const manifest = require('./public/dist/manifest.json');
const expressLayouts = require('express-ejs-layouts')
const { redirects } = require('./util/redirects');
const AppError = require('./util/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');


// Import Configurations
const routes = require('./config/routes');
const applyMiddlewares = require('./middlewares/global');

// Initialize Express
const app = express();

// Apply Middleware
applyMiddlewares(app);


app.use((req, res, next) => {
  res.set("Connection", "keep-alive");
  next();
});

// Initialize Passport
require('./config/passport');
app.use(passport.initialize());

// Event Listeners
require('./listeners/orderListeners');  
require('./listeners/productListeners'); 
require('./listeners/contactFormListener');
require('./listeners/orderWebhookListener'); 
require('./listeners/orderUpdateListener');
// require('./listeners/metaCapiListener');
require('./listeners/purchaseGroupListener');

// Set View Engine
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));

const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: ONE_YEAR,
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', filePath.endsWith('.html') ? 'no-cache' : 'public, max-age=31536000, immutable');
  }
}));

app.use((req, res, next) => {
  res.locals.manifest = manifest;
  next();
});



app.use((req, res, next) => {
  try {
    const decodedPath = decodeURIComponent(req.path);

    if (decodedPath === '/login') return next();

    if (redirects[decodedPath]) {
      return res.redirect(301, redirects[decodedPath]);
    }
  } catch (e) {
    console.warn("Failed to decode path:", req.path);
  }

  next();
});

app.use(routes.viewsRoute);
app.use(routes.sitemapRoutes);
app.use('/admin', routes.adminRoutes);
// app.use('/api/v1',  routes.authRoutes);

Object.entries(routes.apiRoutes).forEach(([routeName, routeHandler]) => {
  app.use(`/api/v1/${routeName}`, routeHandler);
});

// const rateLimits = {
//   global: rateLimit({ max: 400, windowMs: 60 * 60 * 1000 }),
//   login: rateLimit({ max: 5, windowMs: 60 * 60 * 1000 }),
//   checkout: rateLimit({ max: 10, windowMs: 60 * 60 * 1000 }),
// };

const rateLimits = {
  global: rateLimit({
    max: 400,
    windowMs: 60 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'fail',
      message: 'Too many requests',
    },
  }),

  login: rateLimit({
    max: 5,
    windowMs: 60 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'fail',
      message: 'Too many login attempts',
    },
  }),

  checkout: rateLimit({
    max: 10,
    windowMs: 60 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'fail',
      message: 'Too many checkout attempts',
    },
  }),
};

app.use('/api', rateLimits.global);
app.use('/api/v1/users/login', rateLimits.login);
app.use('/api/v1/orders/checkout', rateLimits.checkout);

if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug/clear-session', (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to clear session" });
      res.clearCookie('connect.sid');
      res.json({ message: "Session cleared" });
    });
  });
}

app.all('*', (req, res, next) => next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)));
app.use(globalErrorHandler);

module.exports = app;
