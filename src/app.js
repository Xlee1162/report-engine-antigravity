const pipeline = require('./core/pipeline');
const scheduler = require('./scheduler');
const worker = require('./worker');
const apiServer = require('./api/server'); // To be implemented
const logger = require('./logger');
const path = require('path');

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command) {
		console.error('Usage:');
		console.error('  Run once:  node src/app.js run <path-to-config>');
		console.error('  Scheduler: node src/app.js schedule <config-dir>');
		console.error('  Worker:    node src/app.js worker');
		console.error('  API:       node src/app.js api');
		process.exit(1);
	}

	try {
		if (command === 'schedule') {
			const configDir = args[1];
			if (!configDir) {
				console.error(
					'Error: Config directory required for scheduler mode.'
				);
				process.exit(1);
			}
			await scheduler.start(configDir);
			// Keep process alive
		} else if (command === 'worker') {
			await worker.startWorker();
		} else if (command === 'api') {
			await apiServer.start();
		} else if (command === 'run') {
			const configPath = args[1];
			if (!configPath) {
				console.error('Error: Config path required for run mode.');
				process.exit(1);
			}
			await pipeline.run(configPath);
		} else {
			// Assume implicit run if file exists, or just legacy mode
			// Check if arg is a file
			if (command.endsWith('.js') || command.endsWith('.json')) {
				await pipeline.run(command);
			} else {
				console.error(`Unknown command: ${command}`);
				process.exit(1);
			}
		}
	} catch (error) {
		console.error('Application crashed:', error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}

module.exports = main;
