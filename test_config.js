module.exports = {
	report_id: 'test_report_01',
	schedule: '0 8 * * *',
	timezone: 'Asia/Ho_Chi_Minh',

	datasets: [
		{
			name: 'summary_by_machine',
			collection: 'production_logs',
			pipeline: [
				{
					$group: {
						_id: '$machine',
						total_output: { $sum: '$output' },
					},
				},
				{
					$project: {
						machine: '$_id',
						total_output: 1,
						_id: 0,
					},
				},
			],
		},
	],

	excel: {
		// No template -> generate new
		dataset_map: [
			{
				dataset: 'summary_by_machine',
				sheet: 'Summary',
				start_cell: 'A1',
				include_header: true,
			},
		],
	},

	render_blocks: [
		{
			id: 'table_block',
			type: 'table',
			render: 'html',
			order: 1,
			dataset: 'summary_by_machine',
			range: 'A1', // Not strictly used for HTML render logic but kept for completeness
		},
		{
			id: 'chart_block_placeholder',
			type: 'chart',
			render: 'image',
			order: 2,
			range: 'B1:C10',
		},
	],

	mail: {
		to: ['test@example.com'],
		subject: 'Test Report from Engine',
		attach_excel: true,
	},
};
