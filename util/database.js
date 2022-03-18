const mongoose = require('mongoose');

require('dotenv').config();
const { MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD, MONGO_INITDB_DATABASE } = process.env;

exports.connect = () => mongoose.connect(`mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongodb/${MONGO_INITDB_DATABASE}?authSource=admin`);