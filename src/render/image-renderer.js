const logger = require('../logger');

class ImageRenderer {
	async render(block, data) {
		logger.warn(
			`Image rendering requested for block ${block.id}, but accurate chart rendering requires external tools. Returning placeholder.`
		);

		// In a real scenario, this would call an external service or a headless browser
		// For now, we return a simple HTML placeholder explanation, or a path to a static image if we had one.
		// Since the prompt asks for "Render Engine" which resolves to "RenderableBlock", and the output for Image type is typically a path (CID) for mail.
		// We will return a placeholder object intended for the Mail Renderer to handle.

		return {
			isPlaceholder: true,
			text: `[Chart: ${block.id}] - Image rendering requires external adapter.`,
		};
	}
}

module.exports = new ImageRenderer();
