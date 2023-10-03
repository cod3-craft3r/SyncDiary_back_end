const jwt = require('jsonwebtoken');
const JWT_SECRET = 'thenorthremembers';

const fetchuser = (req, res, next) => {
// get the user from the jwt token, parse it to figure out the ID & then add it to the `req` object
  const token = req.header('auth-token');
  if(!token) {
    res.status(401).json({error: 'please use a valid token'});
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch(err) {
    console.error('ERROR: ', err.message);
    res.status(500).send('internal server error'); 
  }
};

module.exports = fetchuser;
