require('dotenv').config();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = () => {
  return MongoClient.connect(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongodb`)
    .then(console.log('Connected to MongoDB!'))
    .catch(err => console.log(err));
}

module.exports = mongoConnect;