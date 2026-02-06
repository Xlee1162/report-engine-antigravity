const htmlRenderer = require('./html-table-renderer');
const imageRenderer = require('./image-renderer');

class RendererFactory {
	getRenderer(type, mode) {
		if (mode === 'image') {
			return imageRenderer;
		}
		// Default to HTML for tables, or if mode is html
		return htmlRenderer;
	}
}

module.exports = new RendererFactory();
