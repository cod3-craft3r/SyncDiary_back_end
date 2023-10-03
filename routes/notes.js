const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes.js')
const fetchuser = require('../middlewares/fetchuser.js');

// ROUTE1 - fetching all the notes that a user has. REQUIRES LOGGING IN
router.get('/fetch-notes', fetchuser, async (req, res) => {
//  res.send('welcome to notes!')
  try {
    const notes = await Notes.find({user: req.user.id});
    res.json(notes);
  } catch(err) {
    console.error('ERROR: ', err.message);
    res.status(500).send('internal sever error');
  }
});

// ROUTE2 - adding a new note into user's account. REQUIRES LOGGING IN
router.post('/add-note', fetchuser, [
  body('title', 'enter a title').exists(),
  body('descr', 'please enter a desciption; it will be helpful for you 😁').exists()
], async (req, res) => {
  // if there are any errors, return a `Bad request!` and the errors
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  try {
    const note = new Notes({
      title: req.body.title,
      descr: req.body.descr,
      tag: req.body.tag ? req.body.tag : ''
    });

    const saveNote = await note.save();

    res.json(savedNote);
  } catch(err) {
    console.error('ERROR: ', err.message);
    res.status(500).send('internal sever error');
  }
});

module.exports = router;
