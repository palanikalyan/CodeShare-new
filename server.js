const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nunjucks = require('nunjucks');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure nunjucks
nunjucks.configure('views', {
  autoescape: true,
  express: app
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set template engine
app.set('view engine', 'njk');

// Routes
app.use('/', routes);

// Start server
app.listen(PORT, () => {
  console.log(`CodeShare is running on http://localhost:${PORT}`);
});