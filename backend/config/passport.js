const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { v4: uuidv4 } = require('uuid');
const { query } = require('./database');

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const existingUser = await query(
          'SELECT * FROM users WHERE email = ?',
          [profile.emails[0].value]
        );

        if (existingUser.rows.length > 0) {
          // User exists, return user
          return done(null, existingUser.rows[0]);
        }

        // Create new user
        const userId = uuidv4();
        const email = profile.emails[0].value;
        const username = profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Math.floor(Math.random() * 1000);
        
        // Create user with a random password (they'll use Google OAuth)
        const randomPassword = require('crypto').randomBytes(32).toString('hex');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(randomPassword, 12);

        await query(
          `INSERT INTO users (id, email, username, password_hash, role, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'beginner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [userId, email, username, hashedPassword]
        );

        // Create user progress record
        await query(
          `INSERT INTO user_progress (user_id, skills, completed_modules, current_module, streak_days, total_learning_hours)
           VALUES (?, '{}', '[]', NULL, 0, 0)`,
          [userId]
        );

        // Award first login badge
        const badgeService = require('../services/badgeService');
        await badgeService.awardBadge(userId, 'first_login');

        // Get the created user
        const newUser = await query(
          'SELECT id, email, username, role, created_at FROM users WHERE id = ?',
          [userId]
        );

        return done(null, newUser.rows[0]);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await query(
      'SELECT id, email, username, role, created_at FROM users WHERE id = ?',
      [id]
    );
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
