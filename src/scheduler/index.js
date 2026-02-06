const cron = require('node-cron');
const logger = require('../logger');
// const pipeline = require('../core/pipeline');
const jobQueue = require('../queue/job-queue');
const mongoConnection = require('../mongo/connection');
const configLoader = require('../config/loader');
const fs = require('fs-extra');
const path = require('path');

class Scheduler {
	constructor() {
		this.tasks = [];
	}

	/**
	 * Start the scheduler
	 * @param {string} configDir Directory containing report configs
	 */
	async start(configDir) {
		logger.info(`Starting Scheduler, watching: ${configDir}`);

		// Ensure DB Connection for Queue
		try {
			const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
			await mongoConnection.connectToMongo(uri, 'report_engine_test');
		} catch (e) {
			logger.error('Scheduler failed to connect to DB', {
				error: e.message,
			});
			return;
		}

		try {
			const files = await fs.readdir(configDir);

			for (const file of files) {
				if (file.endsWith('.js') || file.endsWith('.json')) {
					const configPath = path.join(configDir, file);
					await this.scheduleReport(configPath);
				}
			}

			// Start Maintenance Task
			this.scheduleMaintenance();
		} catch (error) {
			logger.error('Failed to start scheduler', { error: error.message });
		}
	}

	async scheduleReport(configPath) {
		try {
			const config = await configLoader.loadConfig(configPath);

			if (!config.schedule) {
				logger.warn(
					`Skipping ${config.report_id}: No schedule defined.`
				);
				return;
			}

			logger.info(
				`Scheduling report '${config.report_id}' with cron: '${config.schedule}' (TZ: ${config.timezone})`
			);

			const task = cron.schedule(
				config.schedule,
				async () => {
					logger.info(
						`Triggering scheduled report (Queueing): ${config.report_id}`
					);
					try {
						// await pipeline.run(configPath); // OLD
						await jobQueue.addJob(config.report_id, configPath); // NEW
					} catch (error) {
						logger.error(
							`Failed to queue job for ${config.report_id}`,
							{ error: error.message }
						);
					}
				},
				{
					timezone: config.timezone || 'Asia/Ho_Chi_Minh',
				}
			);

			this.tasks.push(task);
		} catch (error) {
			logger.error(`Failed to schedule config: ${configPath}`, {
				error: error.message,
			});
		}
	}

	/**
	 * Schedule internal maintenance tasks
	 */
	scheduleMaintenance() {
		// Run cleanup every 10 minutes
		const ttl = parseInt(process.env.QUEUE_JOB_TTL) || 90;

		logger.info(
			`Scheduling Queue Maintenance (TTL: ${ttl}m) every 10 minutes.`
		);

		const task = cron.schedule('*/10 * * * *', async () => {
			await jobQueue.cleanupStaleJobs(ttl);
		});

		this.tasks.push(task);
	}

	stop() {
		logger.info('Stopping all scheduled tasks...');
		this.tasks.forEach((task) => task.stop());
		this.tasks = [];
	}
}

module.exports = new Scheduler();
