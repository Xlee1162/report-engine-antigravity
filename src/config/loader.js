const fs = require('fs-extra');
const path = require('path');
const { ReportConfigSchema } = require('./schema');
const logger = require('../logger');

/**
 * Load and validate report configuration
 * @param {string} configPath - Absolute or relative path to config file
 * @returns {Promise<object>} Validated config object
 */
async function loadConfig(configPath) {
	try {
		const absolutePath = path.resolve(configPath);

		if (!(await fs.pathExists(absolutePath))) {
			throw new Error(`Config file not found: ${absolutePath}`);
		}

		// Support both JSON and JS files
		let rawConfig;
		if (absolutePath.endsWith('.js')) {
			rawConfig = require(absolutePath);
		} else {
			rawConfig = await fs.readJson(absolutePath);
		}

		// Validate against schema
		const validation = ReportConfigSchema.safeParse(rawConfig);

		if (!validation.success) {
			const errorMsg = validation.error.issues
				.map((i) => `${i.path.join('.')}: ${i.message}`)
				.join('; ');
			throw new Error(`Config validation failed: ${errorMsg}`);
		}

		return validation.data;
	} catch (error) {
		if (logger && logger.error) {
			logger.error('Failed to load config', { error: error.message });
		} else {
			console.error('Failed to load config:', error);
		}
		throw error;
	}
}

module.exports = {
	loadConfig,
};
