
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/User');

// // ✅ Use env variables for security
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const GOOGLE_CALLBACK_URL = process.env.NODE_ENV === "production"
//   ? "https://il.inokim.com/api/v1/auth/google/callback"  
//   : "http://localhost:3000/api/v1/auth/google/callback"; 

// // 🔐 Google Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: GOOGLE_CLIENT_ID,
//       clientSecret: GOOGLE_CLIENT_SECRET,
//       callbackURL: GOOGLE_CALLBACK_URL,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails[0].value;
//         let user = await User.findOne({ email });

//         if (!user) {
//           user = await User.create({
//             name: profile.displayName,
//             email,
//             password: 'GoogleAuthTempPassword123!', // Just a placeholder
//             googleId: profile.id
//           });
//         } else if(!user.googleId) {
//           user.googleId = profile.id;
//           await user.save();
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// // ✅ Passport session handling (if using sessions)
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// module.exports = passport;


const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// ✅ Use env variables for security
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.NODE_ENV === "production"
  ? "https://il.inokim.com/api/v1/auth/google/callback"
  : "http://localhost:3000/api/v1/auth/google/callback";

// 🔐 Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/content'],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            password: 'GoogleAuthTempPassword123!', // Placeholder
            googleId: profile.id,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
          });
        } else {
          user.googleId = profile.id;
          user.googleAccessToken = accessToken;
          user.googleRefreshToken = refreshToken;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ✅ Passport session handling (if using sessions)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
