require('dotenv').config();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const { MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD, MONGO_INITDB_DATABASE } = process.env;

let _db;

const mongoConnect = () => {
  return MongoClient.connect(`mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongodb/${MONGO_INITDB_DATABASE}?authSource=admin`)
    .then(client => {
      console.log('Connected to MongoDB!');
      _db = client.db();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
}

const getDb = () => {
  if (_db) {
    return _db;
  }
  console.log('No database found!');
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;