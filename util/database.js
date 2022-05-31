const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session');

require('dotenv').config();
const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_DATABASE, MONGODB_CLUSTERNAME } = process.env;
const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTERNAME}.mongodb.net/${MONGODB_DATABASE}?retryWrites=true&w=majority`

exports.connect = () => mongoose.connect(MONGODB_URI);

exports.getStore = (session) => new MongoDBStore(session)({
  uri: MONGODB_URI,
  collection: 'sessions'
});