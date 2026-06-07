
const { DataTypes } = require('sequelize');
const { OKR } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	sequelize.define('Okr', {
		id: {
			type:         DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey:   true,
		},
		title: {
			type:      DataTypes.STRING(200),
			allowNull: false,
			validate: {
				notEmpty: true,
			},
		},
		description: {
			type:      DataTypes.TEXT,
			allowNull: true,
		},
		responsible_employee_id: {
			type:      DataTypes.UUID,
			allowNull: false,
		},
		period: {
			type:      DataTypes.ENUM(...Object.values(OKR.PERIODS)),
			allowNull: false,
		},
		metric_type: {
			type:      DataTypes.ENUM(...Object.values(OKR.METRIC_TYPES)),
			allowNull: false,
		},
		target_value: {
			type:      DataTypes.FLOAT,
			allowNull: false,
		},
		current_value: {
			type:         DataTypes.FLOAT,
			allowNull:    false,
			defaultValue: 0,
		},
		due_date: {
			type:      DataTypes.DATEONLY,
			allowNull: true,
		},
		parent_id: {
			type:      DataTypes.UUID,
			allowNull: true,
		},
		status: {
			type:         DataTypes.ENUM(...Object.values(OKR.STATUS)),
			allowNull:    false,
			defaultValue: OKR.STATUS_NOT_STARTED,
		},
	}, {
		sequelize,
		modelName: 'Okr',
		tableName: 'okrs',
		timestamps: true,
		schema:    process.env.DB_SCHEMA || 'public',
	});
};
