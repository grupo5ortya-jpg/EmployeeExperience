
const { DataTypes } = require('sequelize');
const { EMPLOYEE_TASK } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	const EmployeeTask = sequelize.define('EmployeeTask',
		{
			employee_id: {
				type: DataTypes.UUID,
				allowNull: false,
				primaryKey: true
			},
			task_id: {
				type: DataTypes.UUID,
				allowNull: false,
				primaryKey: true
			},
			status: {
				type: DataTypes.ENUM(...Object.values(EMPLOYEE_TASK.STATUS)),
				allowNull: false,
				defaultValue: EMPLOYEE_TASK.STATUS_ENROLLED,
			},
			due_date: {
				type: DataTypes.DATE,
				allowNull: false,
			}
		},
		{
			sequelize,
			modelName: 'EmployeeTask',
			tableName: 'employee_tasks',
			timestamps: true,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);

	EmployeeTask.removeAttribute('id');

	return EmployeeTask;
}
