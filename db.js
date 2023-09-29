const mongoose = require('mongoose')

const mongoURI = 'mongodb://127.0.0.1:27017';

const connectToMongo = async () => {
  const con = await mongoose.connect(mongoURI);
  console.log(`${con.connection.host}`);
};

module.exports = connectToMongo;
