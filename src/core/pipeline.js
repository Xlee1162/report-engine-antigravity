const configLoader = require('../config/loader');
const mongoConnection = require('../mongo/connection');
const rawdataManager = require('../rawdata/rawdata-manager');
const excelGenerator = require('../excel/excel-generator');
const blockEngine = require('./block-engine');
const mailRenderer = require('../mail/mail-renderer');
const mailSender = require('../mail/mail-sender'); // To be implemented
const logger = require('../logger');

const auditLogger = require('../mongo/audit-logger');

class ReportPipeline {
	async run(configPath, runtimeParams = {}) {
		logger.info(`Starting pipeline with config: ${configPath}`);

		let config;
		let logId = null;

		try {
			// 1. Load Config
			config = await configLoader.loadConfig(configPath);

			// 2. Connect DB (if datasets exist)
			if (config.datasets && config.datasets.length > 0) {
				// Assume DB URI is in process.env or just local default
				const uri =
					process.env.MONGO_URI || 'mongodb://localhost:27017';
				await mongoConnection.connectToMongo(uri, 'report_engine_test'); // DB Name could be from config
			}

			// [NEW] Start Audit Log
			if (config) {
				// Ensure config is loaded
				logId = await auditLogger.logStart(config.report_id, config);
			}

			// 3. Fetch Data
			const datasets = await rawdataManager.fetchAll(
				config,
				runtimeParams
			);

			// 4. Generate Excel
			const excelPath = await excelGenerator.generate(config, datasets);

			// 5. Render Blocks
			const renderedBlocks = await blockEngine.resolveBlocks(
				config.render_blocks,
				datasets
			);

			// 6. Render Mail
			const mailBody = mailRenderer.renderBody(renderedBlocks);

			// 7. Send Mail
			await mailSender.send(config.mail, mailBody, excelPath);

			// [NEW] End Audit Log (Success)
			await auditLogger.logEnd(logId, 'Success');

			logger.info('Pipeline completed successfully.');
			return { excelPath, mailBody };
		} catch (error) {
			logger.error('Pipeline failed', {
				error: error.message,
				stack: error.stack,
			});
			// [NEW] End Audit Log (Failed)
			if (logId) {
				await auditLogger.logEnd(logId, 'Failed', error.message);
			}
			throw error;
		} finally {
			await mongoConnection.closeConnection();
		}
	}
}

module.exports = new ReportPipeline();
