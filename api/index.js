// Vercel Entry Point Proxy
// This ensures that Vercel uses the main backend logic from /backend/server.js
const app = require('../backend/server');

module.exports = app;
