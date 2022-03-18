const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session');

require('dotenv').config();
const { MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD, MONGO_INITDB_DATABASE } = process.env;
const MONGODB_URI = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongodb/${MONGO_INITDB_DATABASE}?authSource=admin`

exports.connect = () => mongoose.connect(MONGODB_URI);

exports.getStore = (session) => new MongoDBStore(session)({
  uri: MONGODB_URI,
  collection: 'sessions'
});