const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes.js');
const fetchuser = require('../middlewares/fetchuser.js');

// ROUTE1 - fetching all the notes that a user has. REQUIRES LOGGING IN
router.get('/fetch-notes', fetchuser, async (req, res) => {
//  res.send('welcome to notes!')
  try {
    const userID = req.user.id;
    const notes = await Notes.find({user: userID});
    res.json(notes);
  } catch(err) {
    console.error('ERROR: ', err.message);
    res.status(401).json({error: 'invalid token'});
  }
});

// ROUTE2 - adding a new note into user's account. REQUIRES LOGGING IN
router.post('/add-note', fetchuser, [
  body('title', 'enter a title').isLength({min: 1}),
  body('descr', 'please enter a desciption; it will be helpful for you 😁').isLength({min: 1})
], async (req, res) => {
  // if there are any errors, return a `Bad request!` and the errors
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  try {
    const note = new Notes({
      user: req.user.id,
      title: req.body.title,
      descr: req.body.descr,
      tag: req.body.tag
    });

    const savedNote = await note.save();

    res.json(savedNote);
  } catch(err) {
    console.error('ERROR: ', err);
    res.status(500).send('internal sever error');
  }
});

// ROUTE3 - updating the existing notes of the user -> REQUIRES LOGGING IN.
router.put('/update-note/:id', fetchuser, async (req, res) => {
  try {
  const { title, descr, tag } = req.body;

  // create a new note
  const newNote = {};

  if(title) {newNote.title = title}
  if(descr) {newNote.descr = descr}
  if(tag) {newNote.tag = tag}

  // find the note to be updated using the id parameter in the URL
  let note = await Notes.findById(req.params.id);  // this is how we get the note that is to be updated
  if(!note) {
     return res.status(404).json({error: 'note not found'});
  }
  
  if(note.user.toString() !== req.user.id) {
    return res.status(401).json({error: 'you can only edit your notes. shared notes coming soon!'});
  }

  note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});

  res.json(note);
  } catch(err) {
    console.error('ERROR: ', err.message);
    res.status(500).send('internal server error');
  }
});

// ROUTE4 - deleting a note in user's account. REQUIRES LOGGING IN
router.delete('/delete-note/:id', fetchuser, async (req, res) => {
  try {
    const { title, descr } = req.body;

    let note = await Notes.findById(req.params.id);
    if(!note) {
      return res.status(404).json({error: 'note not found.'});
    }

    if(note.user.toString() !== req.user.id) {
      return res.status(401).json({error: 'you can delete only your own notes.'});
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json(`${note.title} has been successfully deleted.`);
  } catch(err) {
    console.log('ERROR: ', err.message);
    res.status(500).send('internal server error');
  }
});

module.exports = router;
