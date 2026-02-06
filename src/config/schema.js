const { z } = require('zod');

const RenderBlockSchema = z.object({
	id: z.string(),
	sheet: z.string().optional(),
	range: z.string(),
	type: z.enum(['table', 'chart', 'mixed']),
	render: z.enum(['html', 'image']),
	order: z.number().int(),
	dataset: z.string().optional(), // Link to a specific dataset
	options: z.record(z.any()).optional(), // Extra options for rendering
});

const MongoQuerySchema = z.object({
	name: z.string(),
	collection: z.string(),
	pipeline: z.array(z.any()).default([]), // Aggregation pipeline stages
	params: z.record(z.any()).optional(), // Parameters to inject into pipeline
});

const MailConfigSchema = z.object({
	to: z.array(z.string().email()),
	cc: z.array(z.string().email()).optional(),
	subject: z.string(),
	attach_excel: z.boolean().default(true),
	body_template: z.string().optional(),

	// SMTP Config (Optional)
	smtp: z
		.object({
			host: z.string(),
			port: z.number().int(),
			secure: z.boolean().default(false),
			auth: z
				.object({
					user: z.string().optional(),
					pass: z.string().optional(),
				})
				.optional(),
		})
		.optional(),

	// Fallback EXE Config (Optional)
	fallback: z
		.object({
			enabled: z.boolean().default(false),
			command: z.string(),
			args: z.array(z.string()).default([]),
		})
		.optional(),
});

const ReportConfigSchema = z.object({
	report_id: z.string(),
	schedule: z.string(), // Cron expression
	timezone: z.string().default('Asia/Ho_Chi_Minh'),

	data_scope: z
		.object({
			lookback_days: z.number().int().default(0),
			retention_days: z.number().int().optional(),
		})
		.optional(),

	datasets: z.array(MongoQuerySchema),

	excel: z.object({
		template: z.string().optional(),
		output_path: z.string().optional(),
		dataset_map: z
			.array(
				z.object({
					dataset: z.string(),
					sheet: z.string(),
					start_cell: z.string(),
					include_header: z.boolean().default(true),
				})
			)
			.optional(),
	}),

	render_blocks: z.array(RenderBlockSchema),

	mail: MailConfigSchema,
});

module.exports = {
	ReportConfigSchema,
};
