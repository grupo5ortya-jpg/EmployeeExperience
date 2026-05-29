const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	const PulseAnalysis = sequelize.define('PulseAnalysis', {
		survey_assignment_id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
		},
		question_id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
		},
		sentiment: {
			type: DataTypes.ENUM('positive', 'neutral', 'negative'),
			allowNull: false,
		},
		risk_level: {
			type: DataTypes.ENUM('low', 'medium', 'high'),
			allowNull: false,
		},
		topics: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
		},
		summary: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		overall_risk: {
			type: DataTypes.STRING(20),
			allowNull: true,
		},
		reasoning: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		scores_snapshot: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
		},
	}, {
		sequelize,
		modelName: 'PulseAnalysis',
		tableName: 'pulse_analyses',
		timestamps: true,
		schema: process.env.DB_SCHEMA || 'public',
	});

	PulseAnalysis.removeAttribute('id');

	return PulseAnalysis;
};
