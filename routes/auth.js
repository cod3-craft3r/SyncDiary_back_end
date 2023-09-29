const express = require('express');
const router = express.Router();
const User = require('../models/User.js');

// the home of this api will be used to CREATE a new user, so it won't require any authentication per se & will be created by hitting -> '/api/auth/'
router.post('/', (req, res) => {
  console.log(req.body);
  const user = User(req.body);
  user.save();
  res.send('welcome to auth!')
});

module.exports = router;
