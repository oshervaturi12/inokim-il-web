// config/middleware.js
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
// const minifyHTML = require('express-minify-html');
const minifyHTML = require('express-minify-html-terser');
const cookieParser = require('cookie-parser');
const i18n = require('i18n');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const optimizeImageMiddleware = require('./optimizeImageMiddleware');
const setLocals = require('./setLocals');
const loadStoreSettings = require('./storeSettings');
const setFooter = require('./setFooter');
const ABTest = require('./loadABTests')
// const applySecurityProtections = require('./security');
const { checkNoVAT } = require('../controllers/vatModeController');
const path = require('path');

const { attachCart } = require('./cartMiddleware');


const express = require('express');

module.exports = (app) => {
  app.enable('trust proxy');

  if (!process.env.NODE_ENV === 'development') {
      app.use((req, res, next) => {
      if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        return next();
      }
      return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
    });

  }


  // Security
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      xssFilter: true,
      noSniff: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );

  const allowedOrigins = [
    'https://il.inokim.com',
    process.env.CLIENT_URL,
    'https://inokimil.myshopify.com',
    'http://localhost:9000',
      'https://l.facebook.com',
    'https://lm.facebook.com',
    'https://m.facebook.com',
    'https://www.facebook.com',
    'https://instagram.com',
    'https://www.instagram.com',
    'https://l.instagram.com',
    'http://www.il.inokim.com'
  ];

  //  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cors({
  origin: (origin, callback) => {
    // console.log('🔍 CORS origin:', origin); // ADD THIS
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
  // app.use(cors());
  // app.options('*', cors());
      

  // applySecurityProtections(app);

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Body Parsing
  // app.use(express.json({ limit: '1000mb' }));
  app.use('/api', express.json({ limit: '1000mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1000kb' }));
  app.use(cookieParser());

  // Data Sanitization
  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());


  i18n.configure({
  locales: ['he', 'ar'],
  defaultLocale: 'he',  
  directory: path.join(__dirname, 'locales'), 
  queryParameter: 'lang',
  cookie: 'lang',         
  objectNotation: true 
});

app.use(i18n.init);

app.use((req, res, next) => {
  if (req.query.lang) {
    res.cookie('lang', req.query.lang);
    req.setLocale(req.query.lang);
  }
  next();
});

  // Performance
  // app.use(minifyHTML({ collapseWhitespace: true }));
  app.use(minifyHTML({
    override: true,
    htmlMinifier: {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyCSS: true,
      minifyJS: true,
      useShortDoctype: true,
      decodeEntities: true,
    }
  }));
  app.use(compression({ level: 6, threshold: 1024 }));
  app.use(optimizeImageMiddleware);

  // Session
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      rolling: true,
      store: MongoStore.create({
        mongoUrl: process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD),
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'interval',
        autoRemoveInterval: 10,
      }),
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: "strict",
        // sameSite: "none",
        maxAge: 14 * 24 * 60 * 60 * 1000,
      },
    })
  );


  app.use(checkNoVAT); 

  // Middleware
  app.use(setLocals);
  app.use(attachCart);
  app.use(loadStoreSettings);
  app.use(setFooter);
  app.use(ABTest);
};
