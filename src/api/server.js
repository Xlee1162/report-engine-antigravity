const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('../logger');
const configLoader = require('../config/loader');
const jobQueue = require('../queue/job-queue');
const {
	getDb,
	connectToMongo,
	closeConnection,
} = require('../mongo/connection');
const fs = require('fs-extra');
const path = require('path');

class ApiServer {
	constructor() {
		this.app = express();
		this.port = process.env.PORT || 3000;

		this.app.use(cors());
		this.app.use(bodyParser.json());

		// Routes
		this.setupRoutes();
	}

	setupRoutes() {
		// GET /api/configs - List all configs
		this.app.get('/api/configs', async (req, res) => {
			try {
				// Assume configs are in './configs' (passed via env or args, but simpler hardcoded default for POC)
				const configDir = process.env.CONFIG_DIR || './configs';
				if (!(await fs.pathExists(configDir))) {
					return res.json([]);
				}
				const files = await fs.readdir(configDir);
				// Filter only js/json
				const configs = files.filter(
					(f) => f.endsWith('.js') || f.endsWith('.json')
				);

				res.json(configs);
			} catch (error) {
				logger.error('API Error', { error: error.message });
				res.status(500).json({ error: error.message });
			}
		});

		// GET /api/configs/:id - Get config detail
		this.app.get('/api/configs/:id', async (req, res) => {
			try {
				const configId = req.params.id; // actually filename
				const configDir = process.env.CONFIG_DIR || './configs';
				const configPath = path.join(configDir, configId);

				if (!(await fs.pathExists(configPath))) {
					return res.status(404).json({ error: 'Config not found' });
				}

				const config = await configLoader.loadConfig(configPath);
				res.json(config);
			} catch (error) {
				res.status(500).json({ error: error.message });
			}
		});

		// PUT /api/configs/:id - Update config
		this.app.put('/api/configs/:id', async (req, res) => {
			try {
				const configId = req.params.id;
				const configDir = process.env.CONFIG_DIR || './configs';
				const configPath = path.join(configDir, configId);
				const newConfig = req.body;

				// Validate first
				// Warning: writing to JS file is complex (requires stringify), JSON is easier.
				// For this POC, we support writing to JSON only.
				if (configId.endsWith('.js')) {
					return res
						.status(400)
						.json({
							error: 'Cannot update .js config files via API. Use .json',
						});
				}

				await fs.writeJson(configPath, newConfig, { spaces: 2 });
				res.json({ message: 'Config updated' });
			} catch (error) {
				res.status(500).json({ error: error.message });
			}
		});

		// GET /api/history - Get run logs
		this.app.get('/api/history', async (req, res) => {
			try {
				const db = getDb();
				const limit = parseInt(req.query.limit) || 20;
				const skip = parseInt(req.query.skip) || 0;

				const logs = await db
					.collection('report_run_logs')
					.find({})
					.sort({ start_time: -1 })
					.skip(skip)
					.limit(limit)
					.toArray();

				res.json(logs);
			} catch (error) {
				res.status(500).json({ error: error.message });
			}
		});

		// POST /api/run/:id - Trigger run
		this.app.post('/api/run/:id', async (req, res) => {
			try {
				const configId = req.params.id; // filename
				const configDir = process.env.CONFIG_DIR || './configs';
				const configPath = path.join(configDir, configId);

				// 1. Get Report ID from config
				const config = await configLoader.loadConfig(configPath);
				const reportId = config.report_id;

				// 2. Add to Queue
				const jobId = await jobQueue.addJob(reportId, configPath);

				res.json({ message: 'Job queued', jobId });
			} catch (error) {
				res.status(500).json({ error: error.message });
			}
		});
	}

	async start() {
		// Connect DB
		const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
		await mongoConnection.connectToMongo(uri, 'report_engine_test');

		this.app.listen(this.port, () => {
			logger.info(`API Server running at http://localhost:${this.port}`);
			console.log(`API Server running at http://localhost:${this.port}`);
		});
	}
}

module.exports = new ApiServer();
