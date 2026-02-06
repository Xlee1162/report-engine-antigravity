const logger = require('../logger');

class ImageRenderer {
	/**
	 * Render an image block as an HTML img tag utilizing CID (Content-ID) for inline embedding.
	 * @param {Object} blockConfig
	 * @param {Array} data
	 */
	async render(blockConfig, data) {
		// For Image Renderer, the actual image generation (Snapshot) happens in the Pipeline
		// BEFORE this renderer is called (or logic is split).
		// However, standard Pipeline flow calls renderers first.

		// Strategy:
		// This renderer simply returns the HTML placeholder.
		// The Pipeline will effectively "fill in" the file later/or concurrently.
		// We use the block ID as the CID.

		const cid = blockConfig.id;
		// Basic style wrapper
		const style =
			blockConfig.options && blockConfig.options.style
				? blockConfig.options.style
				: 'max-width: 100%; height: auto;';
		const align =
			blockConfig.options && blockConfig.options.align
				? `text-align: ${blockConfig.options.align};`
				: '';

		return `
            <div style="${align}">
                <img src="cid:${cid}" alt="${blockConfig.id}" style="${style}" />
            </div>
        `;
	}
}

module.exports = new ImageRenderer();
