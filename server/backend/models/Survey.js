
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
	sequelize.define('Survey', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		// FK a SurveyType (legado / opcional — null en ciclos Feedback 360)
		type_id: {
			type: DataTypes.UUID,
			allowNull: true,
		},
		// FK a QuestionType (para encuestas de onboarding / pulso)
		question_type_id: {
			type: DataTypes.UUID,
			allowNull: true,
		},
		// ── Campos Feedback 360 ──────────────────────────────────
		department_id: {
			type: DataTypes.UUID,
			allowNull: true,
		},
		start_date: {
			type: DataTypes.DATEONLY,
			allowNull: true,
		},
		end_date: {
			type: DataTypes.DATEONLY,
			allowNull: true,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		min_anonymous_responses: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
		},
		// Array JSON con los IDs de competencias seleccionadas
		// Ej: ["communication", "leadership", "teamwork"]
		competencies: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
		},
	}, {
		sequelize,
		modelName: 'Survey',
		tableName: 'surveys',
		schema: process.env.DB_SCHEMA || 'public',
	});
};
