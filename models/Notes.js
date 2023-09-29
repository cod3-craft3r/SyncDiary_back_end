const mongoose = require('mongoose');
const { Schema } = mongoose;

const NoteSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  descr: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: 'General'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mopngoose.model('notes', NoteSchema);
