const handlebars = require('handlebars');
const logger = require('../logger');

class MailRenderer {
	/**
	 * Compile final mail body
	 * @param {Array} renderedBlocks
	 * @returns {string} HTML Body
	 */
	renderBody(renderedBlocks) {
		logger.info('Rendering mail body...');

		let bodyHtml = '<html><body style="font-family: Arial, sans-serif;">';

		renderedBlocks.forEach((block) => {
			bodyHtml += `<div class="render-block" id="block-${block.id}" style="margin-bottom: 20px;">`;

			if (block.renderMode === 'image') {
				// content is placeholder object or path
				if (block.content.isPlaceholder) {
					bodyHtml += `<div style="border: 1px dashed #999; padding: 20px; text-align: center; background: #eee;">${block.content.text}</div>`;
				} else {
					// Assume content is a CID or path - for now simple image tag (real mail sender would handle CIDs)
					bodyHtml += `<img src="${block.content}" alt="${block.id}" style="max-width: 100%;"/>`;
				}
			} else {
				// HTML content
				bodyHtml += block.content;
			}

			bodyHtml += '</div>';
		});

		bodyHtml += '</body></html>';
		return bodyHtml;
	}
}

module.exports = new MailRenderer();
