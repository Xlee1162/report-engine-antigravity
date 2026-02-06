const { getDb } = require('../mongo/connection');
const logger = require('../logger');
const { ObjectId } = require('mongodb');

class JobQueue {
	constructor() {
		this.collectionName = 'job_queue';
	}

	/**
	 * Add a new job to the queue
	 * @param {string} reportId
	 * @param {string} configPath
	 */
	async addJob(reportId, configPath) {
		try {
			const db = getDb();
			const job = {
				report_id: reportId,
				config_path: configPath,
				status: 'pending',
				created_at: new Date(),
				attempts: 0,
			};

			const result = await db
				.collection(this.collectionName)
				.insertOne(job);
			logger.info(
				`Job added to queue: ${result.insertedId} (Report: ${reportId})`
			);
			return result.insertedId;
		} catch (error) {
			logger.error('Failed to add job to queue', {
				error: error.message,
			});
			throw error;
		}
	}

	/**
	 * Get and lock the next pending job
	 * @returns {Promise<Object|null>} Job document
	 */
	async getNextJob() {
		try {
			const db = getDb();
			// Atomically find a pending job and set it to processing
			const result = await db
				.collection(this.collectionName)
				.findOneAndUpdate(
					{ status: 'pending' },
					{
						$set: {
							status: 'processing',
							started_at: new Date(),
						},
						$inc: { attempts: 1 },
					},
					{
						sort: { created_at: 1 }, // FIFO
						returnDocument: 'after',
					}
				);

			return result; // In newer mongodb driver, this is the doc directly or inside .value depending on version.
			// MongoDB Node v6 findOneAndUpdate returns the document directly if includeResultMetadata is false (default is false for v6 but let's check returnDocument behavior).
			// Actually in v5/v6 it returns `null` or the document.
		} catch (error) {
			logger.error('Failed to get next job', { error: error.message });
			return null;
		}
	}

	/**
	 * Mark job as completed
	 * @param {string|ObjectId} jobId
	 */
	async completeJob(jobId) {
		try {
			const db = getDb();
			await db.collection(this.collectionName).updateOne(
				{ _id: new ObjectId(jobId) },
				{
					$set: {
						status: 'completed',
						completed_at: new Date(),
					},
				}
			);
			logger.info(`Job completed: ${jobId}`);
		} catch (error) {
			logger.error(`Failed to complete job ${jobId}`, {
				error: error.message,
			});
		}
	}

	/**
	 * Mark job as failed
	 * @param {string|ObjectId} jobId
	 * @param {string} errorMsg
	 */
	async failJob(jobId, errorMsg) {
		try {
			const db = getDb();
			await db.collection(this.collectionName).updateOne(
				{ _id: new ObjectId(jobId) },
				{
					$set: {
						status: 'failed',
						completed_at: new Date(),
						error: errorMsg,
					},
				}
			);
			logger.error(`Job failed: ${jobId}`, { error: errorMsg });
		} catch (error) {
			logger.error(`Failed to mark job ${jobId} as failed`, {
				error: error.message,
			});
		}
	}

	/**
	 * Cleanup stale jobs (Recovery)
	 * @param {number} ttlMinutes
	 */
	async cleanupStaleJobs(ttlMinutes = 90) {
		try {
			const db = getDb();
			const cutoffTime = new Date(Date.now() - ttlMinutes * 60000);

			// 1. Fail stale PENDING jobs
			const pendingResult = await db
				.collection(this.collectionName)
				.updateMany(
					{
						status: 'pending',
						created_at: { $lt: cutoffTime },
					},
					{
						$set: {
							status: 'failed',
							completed_at: new Date(),
							error: `Timeout (Pending > ${ttlMinutes}m)`,
						},
					}
				);

			if (pendingResult.modifiedCount > 0) {
				logger.warn(
					`Cleaned up ${pendingResult.modifiedCount} stale PENDING jobs.`
				);
			}

			// 2. Fail stale PROCESSING jobs (Stuck/Crashed workers)
			const processingResult = await db
				.collection(this.collectionName)
				.updateMany(
					{
						status: 'processing',
						started_at: { $lt: cutoffTime },
					},
					{
						$set: {
							status: 'failed',
							completed_at: new Date(),
							error: `Timeout (Processing > ${ttlMinutes}m)`,
						},
					}
				);

			if (processingResult.modifiedCount > 0) {
				logger.warn(
					`Cleaned up ${processingResult.modifiedCount} stale PROCESSING jobs.`
				);
			}
		} catch (error) {
			logger.error('Failed to run job queue cleanup', {
				error: error.message,
			});
		}
	}
}

module.exports = new JobQueue();
