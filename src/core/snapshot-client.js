const axios = require('axios');
const logger = require('../logger');
const path = require('path');
const fs = require('fs-extra');

class SnapshotClient {
	constructor() {
		this.serviceUrl =
			process.env.SNAPSHOT_SERVICE_URL || 'http://localhost:7000';
	}

	/**
	 * Request snapshots for charts/ranges in an Excel file
	 * @param {string} inputPath Absolute path to Excel file
	 * @param {Array} items List of items to snapshot: [{ type, sheet, name, outputPath }]
	 * @returns {Promise<boolean>} Success status
	 */
	async requestSnapshots(inputPath, items) {
		if (!items || items.length === 0) return true;

		logger.info(
			`Requesting snapshots from Service (${this.serviceUrl})...`,
			{
				file: path.basename(inputPath),
				count: items.length,
			}
		);

		try {
			const payload = {
				inputPath: inputPath,
				items: items.map((item) => ({
					type: item.type || 'chart',
					sheet: item.sheet,
					name: item.name,
					outputPath: item.outputPath,
				})),
			};

			const response = await axios.post(
				`${this.serviceUrl}/snapshot`,
				payload
			);

			if (response.status === 200 && response.data.success) {
				logger.info('Snapshot request queued successfully.');

				// WAIT for files to appear?
				// The C# service executes async. In a real sync pipeline,
				// we might need to poll for the files or wait for a callback.
				// For this MVP, we will implement a simple Polling Wait here
				// because the Report Pipeline expects files to be ready before sending mail.

				await this.waitForFiles(items.map((i) => i.outputPath));
				return true;
			} else {
				logger.error('Snapshot service returned error', {
					response: response.data,
				});
				return false;
			}
		} catch (error) {
			logger.error('Failed to call Snapshot Service', {
				url: this.serviceUrl,
				error: error.message,
			});
			throw error;
		}
	}

	async waitForFiles(filePaths, timeoutMs = 60000) {
		const start = Date.now();
		logger.info(`Waiting for ${filePaths.length} snapshot files...`);

		while (Date.now() - start < timeoutMs) {
			const pending = [];
			for (const file of filePaths) {
				if (!(await fs.pathExists(file))) {
					pending.push(file);
				}
			}

			if (pending.length === 0) {
				logger.info('All snapshot files generated.');
				return;
			}

			await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s
		}

		throw new Error(
			`Timeout waiting for snapshot files after ${timeoutMs}ms`
		);
	}
}

module.exports = new SnapshotClient();
