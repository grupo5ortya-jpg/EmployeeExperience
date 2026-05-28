const { DataTypes } = require('sequelize');

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
			type: DataTypes.ENUM('positive', 'neutral', 'negative'),
			allowNull: true,
		},
		risk_level: {
			type: DataTypes.ENUM('low', 'medium', 'high'),
			allowNull: true,
		},
		topics: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
		},
		status: {
			type: DataTypes.ENUM('UNREAD', 'READ'),
			allowNull: false,
			defaultValue: 'UNREAD',
		},
	}, {
		sequelize,
		modelName: 'Alert',
		tableName: 'alerts',
		timestamps: true,
		schema: process.env.DB_SCHEMA || 'public',
	});
};
