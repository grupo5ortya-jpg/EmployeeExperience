
const { DataTypes } = require('sequelize');
const { LEARNING_COURSE } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	sequelize.define('LearningCourse',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			title: {
				type: DataTypes.STRING(150),
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},
			duration: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			modality: {
				type: DataTypes.ENUM(...Object.values(LEARNING_COURSE.MODALITIES)),
				allowNull: false,
			},
			link: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			skill_id: {
				type: DataTypes.UUID,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: 'LearningCourse',
			tableName: 'learning_courses',
			timestamps: true,
			paranoid: true,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};
