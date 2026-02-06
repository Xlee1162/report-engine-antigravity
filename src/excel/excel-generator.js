const ExcelJS = require('exceljs');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../logger');

class ExcelGenerator {
	/**
	 * Generate Excel Report
	 * @param {Object} config Report config
	 * @param {Object} datasets Data fetched by RawdataManager
	 * @returns {Promise<string>} Path to generated file
	 */
	async generate(config, datasets) {
		const { excel } = config;
		if (!excel) {
			logger.info('No Excel config found, skipping generation.');
			return null;
		}

		const templatePath = excel.template
			? path.resolve(excel.template)
			: null;
		const outputPath = excel.output_path
			? path.resolve(excel.output_path)
			: this._generateDefaultOutputPath(config.report_id);

		fs.ensureDirSync(path.dirname(outputPath));

		// Case 1: .xlsb Template (Opaque)
		if (templatePath && templatePath.endsWith('.xlsb')) {
			logger.warn(
				'Template is .xlsb (Opaque Mode). Data writing is NOT supported. Copying template only.'
			);
			fs.copySync(templatePath, outputPath);
			return outputPath;
		}

		// Case 2: .xlsx Template or New Workbook
		const workbook = new ExcelJS.Workbook();
		if (
			templatePath &&
			(templatePath.endsWith('.xlsx') || templatePath.endsWith('.xlsm'))
		) {
			if (fs.existsSync(templatePath)) {
				logger.info(`Loading template: ${templatePath}`);
				await workbook.xlsx.readFile(templatePath);
			} else {
				logger.warn(
					`Template file not found: ${templatePath}. Creating new workbook.`
				);
			}
		} else if (!templatePath) {
			logger.info('No template specified. Creating new workbook.');
		}

		// Write Data (only for supported formats)
		if (config.excel.dataset_map && datasets) {
			this._writeDatasets(workbook, config.excel.dataset_map, datasets);
		}

		logger.info(`Saving Excel output to: ${outputPath}`);
		await workbook.xlsx.writeFile(outputPath);
		return outputPath;
	}

	_writeDatasets(workbook, mapping, datasets) {
		for (const map of mapping) {
			const { dataset, sheet, start_cell, include_header } = map;
			const data = datasets[dataset];

			if (!data || !Array.isArray(data)) {
				logger.warn(`Dataset '${dataset}' not found or empty.`);
				continue;
			}

			let worksheet = workbook.getWorksheet(sheet);
			if (!worksheet) {
				logger.info(`Sheet '${sheet}' not found. Creating it.`);
				worksheet = workbook.addWorksheet(sheet);
			}

			logger.info(
				`Writing ${data.length} rows to sheet '${sheet}' starting at ${start_cell}`
			);

			// Allow start_cell to be undefined (default A1) or specific cell
			let startRow = 1;
			let startCol = 1;

			if (start_cell) {
				// Simple regex to split letters and numbers, e.g. "B2" -> 2, 2
				// Note: exceljs handles strings in getCell, but addRows logic is simpler with simple offsets or just appending.
				// For robustness, let's just insert from row/col.
				const cell = worksheet.getCell(start_cell);
				startRow = cell.row;
				startCol = cell.col;
			}

			// Headers
			if (data.length > 0 && include_header) {
				const headers = Object.keys(data[0]);
				worksheet.getRow(startRow).values = headers;
				startRow++;
			}

			// Data
			// Optimization: addRows is faster but appends. To write to specific range, we might need to iterate.
			// For now, assuming simple dump.
			data.forEach((row, index) => {
				const rowValues = Object.values(row);
				// Values assignment is typically 1-based index arrays or objects.
				worksheet.getRow(startRow + index).values = rowValues;
			});
		}
	}

	_generateDefaultOutputPath(reportId) {
		const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
		return path.join('output', `${reportId}_${dateStr}.xlsx`);
	}
}

module.exports = new ExcelGenerator();
