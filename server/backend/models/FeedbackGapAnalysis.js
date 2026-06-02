const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('FeedbackGapAnalysis', {
		id: {
			type:         DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey:   true,
		},
		employee_id: {
			type:      DataTypes.UUID,
			allowNull: false,
		},
		cycle_id: {
			type:      DataTypes.UUID,
			allowNull: false,
		},
		department: {
			type:      DataTypes.STRING(120),
			allowNull: true,
		},
		strengths: {
			type:         DataTypes.JSONB,
			allowNull:    false,
			defaultValue: [],
		},
		gaps: {
			type:         DataTypes.JSONB,
			allowNull:    false,
			defaultValue: [],
		},
		suggestions: {
			type:         DataTypes.JSONB,
			allowNull:    false,
			defaultValue: [],
		},
		summary: {
			type:      DataTypes.TEXT,
			allowNull: true,
		},
		actual_results: {
			type:         DataTypes.JSONB,
			allowNull:    true,
			defaultValue: {},
		},
		expected_results: {
			type:         DataTypes.JSONB,
			allowNull:    true,
			defaultValue: {},
		},
	}, {
		sequelize,
		modelName: 'FeedbackGapAnalysis',
		tableName: 'feedback_gap_analyses',
		timestamps: true,
		schema:     process.env.DB_SCHEMA || 'public',
		indexes: [{
			unique: true,
			fields: ['employee_id', 'cycle_id'],
		}],
	});
};
