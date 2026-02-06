const logger = require('../logger');

class HtmlTableRenderer {
	render(block, data) {
		if (!data || !Array.isArray(data) || data.length === 0) {
			return '<p>No data available for this block.</p>';
		}

		const keys = Object.keys(data[0]);
		let html =
			'<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">';

		// Header
		html += '<thead><tr>';
		keys.forEach((key) => {
			html += `<th style="background-color: #f2f2f2; text-align: left;">${key}</th>`;
		});
		html += '</tr></thead>';

		// Body
		html += '<tbody>';
		data.forEach((row) => {
			html += '<tr>';
			keys.forEach((key) => {
				const value =
					row[key] !== null && row[key] !== undefined ? row[key] : '';
				html += `<td>${value}</td>`;
			});
			html += '</tr>';
		});
		html += '</tbody></table>';

		return html;
	}
}

module.exports = new HtmlTableRenderer();
