const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const hljs = require('highlight.js');

// In-memory database for pastes (replace with a real DB in production)
const pastes = {};

// Home page
router.get('/', (req, res) => {
  res.render('home', { 
    title: 'CodeShare',
    host: req.protocol + '://' + req.get('host')
  });
});

// Create new paste
router.post('/paste', (req, res) => {
  const { code, language } = req.body;
  
  // Validate inputs
  if (!code || code.trim() === '') {
    return res.status(400).render('error', { 
      message: 'Code content is required', 
      title: 'Error'
    });
  }
  
  const id = shortid.generate();
  
  // Try to highlight the code
  let highlighted;
  try {
    highlighted = language && language !== '' ? 
      hljs.highlight(code, { language }).value : 
      hljs.highlightAuto(code).value;
  } catch (error) {
    // Fallback to plain text if highlighting fails
    highlighted = hljs.highlight(code, { language: 'plaintext' }).value;
  }
  
  // Store the paste
  pastes[id] = {
    code,
    language: language || 'plaintext',
    created: new Date(),
    highlighted
  };
  
  res.redirect(`/paste/${id}`);
});

// View paste
router.get('/paste/:id', (req, res) => {
  const id = req.params.id;
  const paste = pastes[id];
  
  if (!paste) {
    return res.status(404).render('error', { 
      message: 'Paste not found', 
      title: 'Not Found'
    });
  }
  
  res.render('view', { 
    paste,
    id,
    title: `CodeShare - Paste ${id}`,
    host: req.protocol + '://' + req.get('host')
  });
});

// Raw paste content
router.get('/raw/:id', (req, res) => {
  const id = req.params.id;
  const paste = pastes[id];
  
  if (!paste) {
    return res.status(404).send('Paste not found');
  }
  
  res.set('Content-Type', 'text/plain');
  res.send(paste.code);
});

// API endpoint to get paste data as JSON
router.get('/api/paste/:id', (req, res) => {
  const id = req.params.id;
  const paste = pastes[id];
  
  if (!paste) {
    return res.status(404).json({ error: 'Paste not found' });
  }
  
  res.json({
    id,
    code: paste.code,
    language: paste.language,
    created: paste.created
  });
});

// Create error page route
router.get('/error', (req, res) => {
  res.render('error', { 
    message: req.query.message || 'An error occurred', 
    title: 'Error'
  });
});

module.exports = router;
