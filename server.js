const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nunjucks = require('nunjucks');
const routes = require('./routes/index');

// Initialize express
const app = express();

// Configure nunjucks
nunjucks.configure('views', {
  autoescape: true,
  express: app,
  noCache: process.env.NODE_ENV === 'development'
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Add request timestamp for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Set template engine
app.set('view engine', 'njk');

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    message: 'Something went wrong!',
    title: 'Server Error'
  });
});

// Routes
app.use('/', routes);

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found', 
    title: 'Not Found'
  });
});

// Start server in local development only
// In production (Vercel), we export the app
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`CodeShare is running on http://localhost:${PORT}`);
  });
}

// Export for serverless environment
module.exports = app;
