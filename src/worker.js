const mongoConnection = require('./mongo/connection');
const jobQueue = require('./queue/job-queue');
const pipeline = require('./core/pipeline');
const logger = require('./logger');

const POLLING_INTERVAL = 5000; // 5 seconds

async function startWorker() {
	logger.info('Starting Worker...');

	// 1. Connect DB
	try {
		const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
		await mongoConnection.connectToMongo(uri, 'report_engine_test');
	} catch (e) {
		logger.error('Worker failed to connect to DB', { error: e.message });
		process.exit(1);
	}

	// 2. Poll Loop
	let running = true;

	// Graceful shutdown
	process.on('SIGINT', () => {
		logger.info('Worker stopping...');
		running = false;
	});

	while (running) {
		try {
			// Attempt to get a job
			const job = await jobQueue.getNextJob();

			if (job) {
				logger.info(
					`Worker picked up job: ${job._id} (Info: ${JSON.stringify(
						job
					)})`
				);

				try {
					// Run Pipeline
					await pipeline.run(job.config_path);

					// Mark Complete
					await jobQueue.completeJob(job._id);
				} catch (err) {
					logger.error(`Job execution failed`, {
						error: err.message,
					});
					// Mark Failed
					await jobQueue.failJob(job._id, err.message);
				}
			} else {
				// No job, wait
				// logger.debug('No jobs...'); // Optional debug
			}
		} catch (error) {
			logger.error('Worker loop error', { error: error.message });
		}

		// Wait before next poll
		if (running) {
			await new Promise((resolve) =>
				setTimeout(resolve, POLLING_INTERVAL)
			);
		}
	}

	await mongoConnection.closeConnection();
	logger.info('Worker stopped.');
}

module.exports = { startWorker };
