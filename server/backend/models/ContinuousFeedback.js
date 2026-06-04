
const { DataTypes } = require('sequelize');
const { CONTINUOUS_FEEDBACK } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	sequelize.define('ContinuousFeedback',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},
			emitter_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			receiver_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			type: {
				type: DataTypes.ENUM(...Object.values(CONTINUOUS_FEEDBACK.TYPES)),
				allowNull: false,
			},
			isAnonymous: {
				type: DataTypes.BOOLEAN
			}
		},
		{
			sequelize,
			modelName: 'ContinuousFeedback',
			tableName: 'continuous_feedback',
			timestamps: true,
			paranoid: true,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};


