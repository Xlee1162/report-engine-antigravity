const configLoader = require('./src/config/loader');
const excelGenerator = require('./src/excel/excel-generator');
const blockEngine = require('./src/core/block-engine');
const mailRenderer = require('./src/mail/mail-renderer');
const mailSender = require('./src/mail/mail-sender');
const logger = require('./src/logger');

async function verifyFramework() {
	console.log('--- STARTING FRAMEWORK VERIFICATION (MOCK DATA) ---');

	try {
		// 1. Load Config
		const config = await configLoader.loadConfig('test_config.js');
		console.log('[OK] Config Loaded');

		// 2. Mock Data (Instead of DB fetch)
		const mockDatasets = {
			summary_by_machine: [
				{ machine: 'M1', total_output: 220 },
				{ machine: 'M2', total_output: 150 },
				{ machine: 'M3', total_output: 80 },
			],
		};
		console.log('[OK] Mock Data Prepared');

		// 3. Generate Excel
		const excelPath = await excelGenerator.generate(config, mockDatasets);
		console.log(`[OK] Excel Generated at: ${excelPath}`);

		// 4. Render Blocks
		const renderedBlocks = await blockEngine.resolveBlocks(
			config.render_blocks,
			mockDatasets
		);
		console.log(`[OK] Blocks Resolved: ${renderedBlocks.length} blocks`);

		// 5. Render Mail Body
		const mailBody = mailRenderer.renderBody(renderedBlocks);
		console.log('[OK] Mail Body Rendered');

		// 6. Send Mail (Mock)
		await mailSender.send(config.mail, mailBody, excelPath);
		console.log('[OK] Mail "Sent" (Debug file created)');

		console.log('--- VERIFICATION SUCCESSFUL ---');
	} catch (error) {
		console.error('VERIFICATION FAILED:', error);
	}
}

verifyFramework();
