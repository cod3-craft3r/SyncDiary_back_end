const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middlewares/fetchuser.js');

const JWT_SECRET = 'thenorthremembers';

// ROUTE1 - the home of this api will be used to CREATE a new user, so it won't require any authentication per se & will be created by hitting -> '/api/auth/onboarding' NO LOGIN REQUIRED TO ENTER THIS ENDPOINT
router.post('/onboarding', [
  body('email', 'please enter a valid email').isEmail(),
  body('name', 'please enter a valid name; cannot be less than 3 characters').isLength({min: 3}),
  body('password', 'please enter a password with minimum length - 8').isLength({min: 8})
], async (req, res) => {
  // if there are any errors, return a `Bad request!` and the errors
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  try {
  // check whether a user with this email already exists
    let user = await User.findOne({email: req.body.email});

    if(user) {
      return res.status(400).json({errors: [{msg: 'sowwy! a user with same email already exists.'}]})
    }

    const salt = await bcrypt.genSalt(10);
    const secPassword = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPassword,
    });

    const payload = {
      user: {
        id: user.id
      }
    }

    const authToken = jwt.sign(payload, JWT_SECRET);
//    console.log(authToken);

    res.json({ authToken });
  } catch(err) {
    console.error('ERROR: ', err.message);
    res.status(500).send('internal server error');
  }
});

// ROUTE2 - authenticate a user -> logging in. NO LOGIN REQUIRED TO ENTER THIS ENDPOINT
router.post('/login', [
  body('email', 'please enter a valid email').isEmail(),
  body('password', 'password cannot be blank').exists()
], async (req, res) => {
  // if there are any errors, return a `Bad request!` and the errors
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({error: 'sowwy! these credentials are not correct.'});
    }

    const comparedPassword = await bcrypt.compare(password, user.password);
    if(!comparedPassword) {
      return res.status(400).json({error: 'sowwy! these credentials are not correct.'});
    }

    const payload = {
      user: {
        id: user.id
      }
    }

    const authToken = jwt.sign(payload, JWT_SECRET);
    res.json({ authToken });
  } catch(err) {
    console.error('ERROR: ', err.message);
    res.status(500).send('internal server error');
  }
});

// ROUTE3 - getting logged in user details. REQUIRES LOGGING INTO USER'S ACCOUNT
router.post('/get-user', fetchuser, async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID).select('-password');
    res.json(user);
  } catch (err) {
    console.log('ERROR: ', err.message);
    res.status(500).send('internal server error');
  }
});

module.exports = router;
