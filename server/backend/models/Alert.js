
const { DataTypes } = require('sequelize');
const { ALERT } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	sequelize.define('Alert', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		employee_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		type: {
			type: DataTypes.STRING(60),
			allowNull: false,
		},
		message: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		sentiment: {
			type: DataTypes.ENUM(...Object.values(ALERT.SENTIMENTS)),
			allowNull: true,
		},
		risk_level: {
			type: DataTypes.ENUM(...Object.values(ALERT.RISK_LEVELS)),
			allowNull: true,
		},
		topics: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
		},
		status: {
			type: DataTypes.ENUM(...Object.values(ALERT.STATUS)),
			allowNull: false,
			defaultValue: ALERT.STATUS_UNREAD,
		},
	}, {
		sequelize,
		modelName: 'Alert',
		tableName: 'alerts',
		timestamps: true,
		schema: process.env.DB_SCHEMA || 'public',
	});
};
