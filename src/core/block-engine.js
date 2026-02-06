const logger = require('../logger');
const rendererFactory = require('../render/renderer-factory');

class BlockEngine {
	/**
	 * Resolve and render all blocks
	 * @param {Array} blocksConfig List of render blocks
	 * @param {Object} datasets All fetch data
	 * @returns {Promise<Array>} List of rendered blocks
	 */
	async resolveBlocks(blocksConfig, datasets) {
		logger.info('Resolving render blocks...');
		const renderedBlocks = [];

		// Sort by order
		const sortedBlocks = [...blocksConfig].sort(
			(a, b) => a.order - b.order
		);

		for (const block of sortedBlocks) {
			try {
				logger.info(
					`Processing block: ${block.id} (Type: ${block.type}, Render: ${block.render})`
				);

				const datasetName = block.dataset; // Should be defined in block config
				const data = datasets[datasetName];

				if (!data && datasetName) {
					logger.warn(
						`Dataset '${datasetName}' for block '${block.id}' is empty or missing.`
					);
				}

				const renderer = rendererFactory.getRenderer(
					block.type,
					block.render
				);
				const content = await renderer.render(block, data);

				renderedBlocks.push({
					id: block.id,
					type: block.type,
					renderMode: block.render,
					content: content,
				});
			} catch (error) {
				logger.error(`Failed to process block ${block.id}`, {
					error: error.message,
				});
				renderedBlocks.push({
					id: block.id,
					error: true,
					content: `<div style="color:red">Error rendering block ${block.id}: ${error.message}</div>`,
				});
			}
		}

		return renderedBlocks;
	}
}

module.exports = new BlockEngine();
