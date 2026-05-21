
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('Question',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			question_type_id: {
				type: DataTypes.UUID,
				allowNull: false
			},
			text: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			type: {
				type: DataTypes.ENUM('Abierta', 'Cerrada'),
				allowNull: false,
			},
			estimated_duration: {
				type: DataTypes.INTEGER,
				allowNull: true,
				validate: {
					min: 0,
				},
				comment: 'Estimated duration in days',
			}
		},
		{
			sequelize,
			modelName: 'Question',
			tableName: 'questions',
			timestamps: true,
			uniqueKeys: {
				unique_text_type: {
					fields: ['text', 'question_type_id'],
				},
			},
			paranoid: true,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};
