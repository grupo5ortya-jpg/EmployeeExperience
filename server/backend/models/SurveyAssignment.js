
const { DataTypes } = require('sequelize');
const { SURVEY_ASSIGNMENT } = require('../utils/constants/models.constants.js');

module.exports = (sequelize) => {
	const SurveyAssignment = sequelize.define('SurveyAssignment', {
		survey_id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true
		},
		employee_id: {
			type: DataTypes.UUID,
			allowNull: true,
			primaryKey: true
		},
		assigned_by: {
			type: DataTypes.UUID,
			allowNull: true,
			primaryKey: true
		},
		due_date: {
			type: DataTypes.DATE,
		},
		status: {
			type: DataTypes.ENUM(...Object.values(SURVEY_ASSIGNMENT.STATUS)),
			defaultValue: SURVEY_ASSIGNMENT.STATUS_PENDING,
		},
	}, {
		sequelize,
		modelName: 'SurveyAssignment',
		tableName: 'survey_assignments',
		paranoid: true,
		schema: process.env.DB_SCHEMA || 'public'
	});
	SurveyAssignment.removeAttribute('id');

	return SurveyAssignment;
};
