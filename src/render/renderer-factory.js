const htmlRenderer = require('./html-table-renderer');
const htmlTableRenderer = require('./html-table-renderer');
const imageRenderer = require('./image-renderer');

class RendererFactory {
	getRenderer(type, renderMode) {
		if (renderMode === 'image') {
			return imageRenderer;
		}
		if (type === 'table' && renderMode === 'html') {
			return htmlTableRenderer;
		}
		// ... extend for others
		throw new Error(
			`No renderer found for type=${type}, mode=${renderMode}`
		);
	}
}

module.exports = new RendererFactory();
