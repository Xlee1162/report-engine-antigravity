const { executeAggregation } = require('../mongo/mongo-executor');
const logger = require('../logger');

class RawdataManager {
	constructor() {
		this.datasets = new Map();
	}

	/**
	 * Fetch all datasets defined in configuration
	 * @param {Object} config Report config
	 * @param {Object} runtimeParams Dynamic params (e.g. execution date)
	 */
	async fetchAll(config, runtimeParams = {}) {
		logger.info('Starting rawdata fetch...');

		// Merge runtime params with config global params (if any)
		// For simplicity, we assume runtimeParams are enough or passed explicitly

		const results = {};

		if (!config.datasets || !Array.isArray(config.datasets)) {
			logger.warn('No datasets defined in config');
			return results;
		}

		for (const datasetConfig of config.datasets) {
			const {
				name,
				collection,
				pipeline,
				params: configParams,
			} = datasetConfig;

			// Merge params: runtime > config
			const mergedParams = { ...configParams, ...runtimeParams };

			try {
				logger.info(`Fetching dataset: ${name}`);
				const data = await executeAggregation(
					collection,
					pipeline,
					mergedParams
				);
				this.datasets.set(name, data);
				results[name] = data;
			} catch (error) {
				logger.error(`Failed to fetch dataset ${name}`, {
					error: error.message,
				});
				throw error; // Or continue if partial failure is allowed? adhering to non-negotiable hard rules, usually fail fast is safer for reports.
			}
		}

		return results;
	}

	getDataset(name) {
		return this.datasets.get(name);
	}
}

module.exports = new RawdataManager();
