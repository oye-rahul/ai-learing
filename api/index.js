// Vercel Serverless Entry Point
// Load environment variables first, then import the app
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });

const app = require('../backend/server');

module.exports = app;
