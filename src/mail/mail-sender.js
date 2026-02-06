const logger = require('../logger');
const fs = require('fs-extra');
const path = require('path');

class MailSender {
	async send(mailConfig, htmlBody, attachmentPath) {
		logger.info(`Sending mail to: ${mailConfig.to.join(', ')}`);
		logger.info(`Subject: ${mailConfig.subject}`);
		if (attachmentPath) {
			logger.info(`Attachment: ${attachmentPath}`);
		}

		// For POC, write the mail body to an HTML file for inspection
		const debugPath = path.join('output', 'debug_mail.html');
		await fs.outputFile(debugPath, htmlBody);
		logger.info(`[DEBUG] Mail body written to: ${debugPath}`);

		return true;
	}
}

module.exports = new MailSender();
