
const { DataTypes } = require('sequelize');
const { FEEDBACK_ASSIGNMENT } = require('../utils/constants/models.constants.js');


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
			type:      DataTypes.ENUM(...DataTypes.Utils.values(FEEDBACK_ASSIGNMENT.TYPES)),
			allowNull: false,
		},
		status: {
			type:         DataTypes.ENUM(...DataTypes.Utils.values(FEEDBACK_ASSIGNMENT.STATUS)),
			allowNull:    false,
			defaultValue: FEEDBACK_ASSIGNMENT.STATUS_PENDING,
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
