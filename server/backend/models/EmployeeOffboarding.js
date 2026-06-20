
const { DataTypes } = require('sequelize');
const { EMPLOYEE_OFFBOARDING } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	sequelize.define('EmployeeOffboarding',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			employee_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			initiated_by: {
				type: DataTypes.UUID,
				allowNull: true,
			},
			last_working_day: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			status: {
				type: DataTypes.ENUM(...Object.values(EMPLOYEE_OFFBOARDING.STATUS)),
				allowNull: false,
				defaultValue: EMPLOYEE_OFFBOARDING.STATUS_IN_PROGRESS,
			},
			rehirable: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			exit_type: {
				type: DataTypes.ENUM(...Object.values(EMPLOYEE_OFFBOARDING.EXIT_TYPE)),
				allowNull: false,
				defaultValue: EMPLOYEE_OFFBOARDING.EXIT_TYPE_RESIGNATION,
			},
			started_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			completed_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: 'EmployeeOffboarding',
			tableName: 'employee_offboardings',
			timestamps: true,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};
