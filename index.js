const connectToMongo = require('./db');

const express = require('express')
const cors = require('cors')
const app = express()
const PORT=8000
app.use(cors({
  origin: '*'
}))

connectToMongo();

// we have to use a middle ware like the one below in order to take requests from the users let's say when authenticating them
app.use(express.json());

// available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.listen(PORT, ()=>{
  console.log(`app is listening at http://localhost:${PORT}`);
})
