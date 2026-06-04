
const { DataTypes } = require('sequelize');
const { JOB_OPENING } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	sequelize.define('JobOpening',
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
			department_id: {
				type: DataTypes.UUID,
				allowNull: true,
			},
			status: {
				type: DataTypes.ENUM(...Object.values(JOB_OPENING.STATUS)),
				defaultValue: JOB_OPENING.STATUS_OPEN,
			},
		},
		{
			sequelize,
			modelName: 'JobOpening',
			tableName: 'job_openings',
			timestamps: true,
			paranoid: true,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};
