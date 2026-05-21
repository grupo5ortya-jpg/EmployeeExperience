
const { DataTypes } = require('sequelize');

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
				type: DataTypes.ENUM('ENROLLED', 'IN_PROGRESS', 'SUBMITED', 'COMPLETED', 'DROPPED'),
				allowNull: false,
				defaultValue: 'ENROLLED',
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


