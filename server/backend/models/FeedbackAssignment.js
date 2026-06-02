const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('FeedbackAssignment', {
		id: {
			type:         DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey:   true,
		},
		cycle_id: {
			type:      DataTypes.UUID,
			allowNull: false,
		},
		evaluator_id: {
			type:      DataTypes.UUID,
			allowNull: false,
		},
		evaluated_id: {
			type:      DataTypes.UUID,
			allowNull: false,
		},
		type: {
			type:      DataTypes.ENUM('SELF', 'PEER', 'LEADER', 'DIRECT_REPORT'),
			allowNull: false,
		},
		status: {
			type:         DataTypes.ENUM('PENDING', 'COMPLETED'),
			allowNull:    false,
			defaultValue: 'PENDING',
		},
		comments: {
			type:         DataTypes.JSONB,
			allowNull:    true,
			defaultValue: {},
		},
		scores: {
			type:         DataTypes.JSONB,
			allowNull:    true,
			defaultValue: {},
		},
	}, {
		sequelize,
		modelName: 'FeedbackAssignment',
		tableName: 'feedback_assignments',
		timestamps: true,
		schema:     process.env.DB_SCHEMA || 'public',
	});
};
