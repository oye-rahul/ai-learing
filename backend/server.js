const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Startup checks for required env
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set. Create backend/.env with JWT_SECRET=your-secret-key');
}
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. Get FREE key: https://aistudio.google.com/app/apikey');
}

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const learningRoutes = require('./routes/learning');
const projectsRoutes = require('./routes/projects');
const analyticsRoutes = require('./routes/analytics');
const playgroundRoutes = require('./routes/playground');
const snippetsRoutes = require('./routes/snippets');
const bookmarksRoutes = require('./routes/bookmarks');
const notificationsRoutes = require('./routes/notifications');
const badgesRoutes = require('./routes/badges');
const shareRoutes = require('./routes/share');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/playground', playgroundRoutes);
app.use('/api/snippets', snippetsRoutes);
app.use('/api/snippets/', snippetsRoutes); // also match trailing slash
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/share', shareRoutes);

// Health check endpoints (for Render and other platforms)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Learning Platform API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health or /api/health',
      auth: '/api/auth/*',
      users: '/api/users/*',
      ai: '/api/ai/*',
      learning: '/api/learning/*',
      projects: '/api/projects/*',
      analytics: '/api/analytics/*',
      playground: '/api/playground/*',
      snippets: '/api/snippets/*',
      bookmarks: '/api/bookmarks/*',
      notifications: '/api/notifications/*',
      badges: '/api/badges/*',
      share: '/api/share/*'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong!'
      : err.message,
  });
});

// 404 handler (must be last)
app.use((req, res) => {
  const isApi = req.path.startsWith('/api/');
  if (isApi) console.warn('⚠️ 404:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    ...(isApi && {
      hint: 'In the backend folder run: npm start (or npm run server), then refresh.',
      path: req.path,
      method: req.method,
    }),
  });
});

// Start server (skip only in Vercel serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`📌 Health check: /health or /api/health`);
    console.log(`📌 API routes: /api/auth, /api/snippets, /api/badges, ...`);
  });
}

module.exports = app;
module.exports = app;