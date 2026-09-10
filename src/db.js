const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'campus_events';

let dbInstance = null;

async function connectDB() {
  if (dbInstance) return dbInstance;
  const client = new MongoClient(uri);
  await client.connect();
  dbInstance = client.db(dbName);
  return dbInstance;
}

module.exports = connectDB;