
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('SurveyType',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			sub_type: {
				type: DataTypes.STRING(100),
				allowNull: true,
			}
		},
		{
			sequelize,
			modelName: 'SurveyType',
			tableName: 'survey_types',
			timestamps: false,
			uniqueKeys: {
				unique_name_subtype: {
					fields: ['name', 'sub_type'],
				},
			},
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};
