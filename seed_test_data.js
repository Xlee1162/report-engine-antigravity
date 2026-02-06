const { MongoClient } = require('mongodb');

async function seed() {
	const uri = 'mongodb://localhost:27017';
	const client = new MongoClient(uri);

	try {
		await client.connect();
		const db = client.db('report_engine_test');

		// Collection: production_logs
		const collection = db.collection('production_logs');
		await collection.deleteMany({}); // Clear old

		const docs = [
			{ machine: 'M1', output: 100, date: new Date() },
			{ machine: 'M2', output: 150, date: new Date() },
			{ machine: 'M1', output: 120, date: new Date() },
			{ machine: 'M3', output: 80, date: new Date() },
		];

		await collection.insertMany(docs);
		console.log('Seeded production_logs with 4 documents.');
	} catch (e) {
		console.error(e);
	} finally {
		await client.close();
	}
}

seed();
