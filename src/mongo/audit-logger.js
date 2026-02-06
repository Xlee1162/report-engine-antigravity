const { getDb } = require('./connection');
const logger = require('../logger');

class AuditLogger {
	constructor() {
		this.collectionName = 'report_run_logs';
	}

	/**
	 * Start logging a report run
	 * @param {string} reportId
	 * @param {Object} configSnapshot
	 * @returns {Promise<string>} Log ID
	 */
	async logStart(reportId, configSnapshot = {}) {
		try {
			const db = getDb();
			const logEntry = {
				report_id: reportId,
				start_time: new Date(),
				status: 'Running',
				config_snapshot: {
					schedule: configSnapshot.schedule,
					datasets: configSnapshot.datasets
						? configSnapshot.datasets.map((d) => d.name)
						: [],
				},
			};

			const result = await db
				.collection(this.collectionName)
				.insertOne(logEntry);
			return result.insertedId;
		} catch (error) {
			logger.error('Failed to write audit log (Start)', {
				error: error.message,
			});
			return null;
		}
	}

	/**
	 * Update log with completion status
	 * @param {string} logId
	 * @param {string} status 'Success' | 'Failed'
	 * @param {string} [errorMessage]
	 */
	async logEnd(logId, status, errorMessage = null) {
		if (!logId) return;

		try {
			const db = getDb();
			const update = {
				$set: {
					end_time: new Date(),
					status: status,
				},
			};

			if (errorMessage) {
				update.$set.error = errorMessage;
			}

			await db
				.collection(this.collectionName)
				.updateOne({ _id: logId }, update);
		} catch (error) {
			logger.error('Failed to write audit log (End)', {
				error: error.message,
			});
		}
	}
}

module.exports = new AuditLogger();
