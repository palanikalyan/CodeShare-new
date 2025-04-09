const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const hljs = require('highlight.js');

// In-memory database for pastes (replace with a real DB in production)
const pastes = {};

// Home page
router.get('/', (req, res) => {
  res.render('home', { title: 'CodeShare' });
});

// Create new paste
router.post('/paste', (req, res) => {
  const { code, language } = req.body;
  const id = shortid.generate();
  
  // Store the paste
  pastes[id] = {
    code,
    language,
    created: new Date(),
    highlighted: language ? 
      hljs.highlight(code, { language }).value : 
      hljs.highlightAuto(code).value
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
    title: `CodeShare - Paste ${id}`
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

module.exports = router;