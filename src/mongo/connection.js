const { MongoClient } = require('mongodb');
const logger = require('../logger');

let client = null;
let db = null;

async function connectToMongo(uri, dbName) {
	if (client) return { client, db };

	try {
		client = new MongoClient(uri);
		await client.connect();
		db = client.db(dbName);
		logger.info(`Connected to MongoDB: ${dbName}`);
		return { client, db };
	} catch (error) {
		logger.error('Failed to connect to MongoDB', { error: error.message });
		throw error;
	}
}

function getDb() {
	if (!db) {
		throw new Error('Database not initialized. Call connectToMongo first.');
	}
	return db;
}

async function closeConnection() {
	if (client) {
		await client.close();
		logger.info('Closed MongoDB connection');
		client = null;
		db = null;
	}
}

module.exports = {
	connectToMongo,
	getDb,
	closeConnection,
};
