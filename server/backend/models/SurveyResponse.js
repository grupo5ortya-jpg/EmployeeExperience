

const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
	const SurveyResponse = sequelize.define('SurveyResponse', {
		survey_assignment_id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true
		},
		question_id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true
		},
		answer_text: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		question_option_id: {
			type: DataTypes.UUID,
			allowNull: true
		},
		numeric_value: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
	}, {
		sequelize,
		modelName: 'SurveyResponse',
		tableName: 'survey_responses',
		timestamps: true,
		paranoid: false,
		schema: process.env.DB_SCHEMA || 'public'
	});
	SurveyResponse.removeAttribute('id');

	return SurveyResponse;
};
