const logger = require('../logger');
const fs = require('fs-extra');
const path = require('path');
const nodemailer = require('nodemailer');
const { spawn } = require('child_process');
const os = require('os');

class MailSender {
	/**
	 * Send email via SMTP or Fallback EXE
	 * @param {Object} mailConfig
	 * @param {string} htmlBody
	 * @param {string} attachmentPath
	 */
	async send(mailConfig, htmlBody, attachmentPath) {
		logger.info(`Preparing to send email to: ${mailConfig.to.join(', ')}`);

		// 1. Try SMTP
		if (mailConfig.smtp) {
			try {
				await this.sendSmtp(mailConfig, htmlBody, attachmentPath);
				return; // Success
			} catch (error) {
				logger.error('SMTP Send Failed', { error: error.message });
				// If fallback is available, proceed. Else throw.
				if (!mailConfig.fallback || !mailConfig.fallback.enabled) {
					throw error;
				}
			}
		} else {
			logger.info('No SMTP config provided. Checking fallback...');
			if (!mailConfig.fallback || !mailConfig.fallback.enabled) {
				// Mock Mode (Legacy behavior if absolutely no config)
				await this.sendMock(mailConfig, htmlBody, attachmentPath);
				return;
			}
		}

		// 2. Try Fallback EXE
		if (mailConfig.fallback && mailConfig.fallback.enabled) {
			logger.info(`Attempting Fallback: ${mailConfig.fallback.command}`);
			await this.sendFallbackExe(mailConfig, htmlBody, attachmentPath);
			return;
		}

		throw new Error(
			'No valid mail sending method configured (SMTP or Flashback).'
		);
	}

	async sendSmtp(config, htmlBody, attachmentPath) {
		const transporter = nodemailer.createTransport({
			host: config.smtp.host,
			port: config.smtp.port,
			secure: config.smtp.secure,
			auth: config.smtp.auth,
		});

		const mailOptions = {
			from: config.smtp.auth
				? config.smtp.auth.user
				: 'noreply@report-engine.local',
			to: config.to.join(', '),
			cc: config.cc ? config.cc.join(', ') : undefined,
			subject: config.subject,
			html: htmlBody,
			attachments: [],
		};

		if (config.attach_excel && attachmentPath) {
			mailOptions.attachments.push({
				path: attachmentPath,
			});
		}

		const info = await transporter.sendMail(mailOptions);
		logger.info('Message sent via SMTP: %s', info.messageId);
	}

	async sendFallbackExe(config, htmlBody, attachmentPath) {
		// 1. Write body to temp file
		const tempBodyPath = path.join(
			os.tmpdir(),
			`mail_body_${Date.now()}.html`
		);
		await fs.writeFile(tempBodyPath, htmlBody, 'utf8');

		// 2. Parse Args
		const rawArgs = config.fallback.args || [];
		const finalArgs = rawArgs.map((arg) => {
			let val = arg;
			val = val.replace('{{to}}', config.to.join(','));
			val = val.replace('{{subject}}', config.subject);
			val = val.replace('{{body_path}}', tempBodyPath);
			val = val.replace('{{attach_path}}', attachmentPath || '');
			return val;
		});

		// 3. Spawn Process
		logger.info(
			`Spawning: ${config.fallback.command} ${finalArgs.join(' ')}`
		);

		return new Promise((resolve, reject) => {
			const child = spawn(config.fallback.command, finalArgs, {
				stdio: 'inherit', // Pipe output to parent
				shell: false, // Security
			});

			child.on('close', (code) => {
				// Cleanup temp file
				fs.remove(tempBodyPath).catch(() => {});

				if (code === 0) {
					logger.info('Fallback EXE finished successfully.');
					resolve();
				} else {
					reject(new Error(`Fallback EXE exited with code ${code}`));
				}
			});

			child.on('error', (err) => {
				fs.remove(tempBodyPath).catch(() => {});
				reject(err);
			});
		});
	}

	async sendMock(config, htmlBody, attachmentPath) {
		// Existing Mock implementation
		const debugDir = path.join(process.cwd(), 'output', 'debug_mail');
		await fs.ensureDir(debugDir);
		const filename = `mail_${Date.now()}.html`;
		await fs.writeFile(path.join(debugDir, filename), htmlBody);
		logger.warn(
			`[MOCK MAIL] Saved to ${path.join(
				debugDir,
				filename
			)} (Attachment: ${attachmentPath})`
		);
	}
}

module.exports = new MailSender();
