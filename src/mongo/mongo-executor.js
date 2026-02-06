const { getDb } = require('./connection');
const logger = require('../logger');
const dayjs = require('dayjs');

/**
 * Recursively replace placeholders in an object or array
 */
function substituteParams(obj, params) {
	if (typeof obj === 'string') {
		// Check for {{param}}
		const match = obj.match(/^{{(.+)}}$/);
		if (match) {
			const key = match[1].trim();
			// If param exists, return it (preserving type)
			if (params.hasOwnProperty(key)) {
				return params[key];
			}
			// Handle special dynamic date params if needed, e.g. {{date}}, {{date-1}}
			// For now, assume params are passed in.
		}
		return obj;
	} else if (Array.isArray(obj)) {
		return obj.map((item) => substituteParams(item, params));
	} else if (obj !== null && typeof obj === 'object') {
		const newObj = {};
		for (const key in obj) {
			newObj[key] = substituteParams(obj[key], params);
		}
		return newObj;
	}
	return obj;
}

/**
 * Execute aggregation pipeline with Retry Logic
 * @param {string} collectionName
 * @param {Array} pipeline
 * @param {Object} params
 * @returns {Promise<Array>}
 */
async function executeAggregation(collectionName, pipeline, params = {}) {
	const db = getDb();
	const collection = db.collection(collectionName);

	// Substitute params in pipeline
	const finalPipeline = substituteParams(pipeline, params);

	logger.info(`Executing aggregation on ${collectionName}`, {
		pipelinePreview: JSON.stringify(finalPipeline).substring(0, 200),
	});

	return executeWithRetry(
		async () => {
			const result = await collection.aggregate(finalPipeline).toArray();
			logger.info(`Aggregation finished. Rows: ${result.length}`);
			return result;
		},
		3,
		1000,
		collectionName
	);
}

/**
 * Retry wrapper
 * @param {Function} task Async task to execute
 * @param {number} retries Max retries
 * @param {number} delayMs Initial delay in ms
 * @param {string} context Context for logging
 */
async function executeWithRetry(task, retries, delayMs, context) {
	try {
		return await task();
	} catch (error) {
		if (retries > 0) {
			logger.warn(
				`Task failed on ${context}. Retrying in ${delayMs}ms... (${retries} retries left). Error: ${error.message}`
			);
			await new Promise((resolve) => setTimeout(resolve, delayMs));
			// Exponential backoff
			return executeWithRetry(task, retries - 1, delayMs * 2, context);
		} else {
			logger.error(`Task failed on ${context} after multiple retries.`);
			throw error;
		}
	}
}

module.exports = {
	executeAggregation,
};
