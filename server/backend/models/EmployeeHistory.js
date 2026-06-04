
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
	const EmployeeHistory = sequelize.define('EmployeeHistory',
		{
			employee_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			department_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			start_date: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			end_date: {
				type: DataTypes.DATEONLY,
				allowNull: true,
			},
			position: {
				type: DataTypes.STRING(120),
				allowNull: true,
			},
			note: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: 'EmployeeHistory',
			tableName: 'employee_histories',
			timestamps: false,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);

	EmployeeHistory.removeAttribute('id');

	return EmployeeHistory;
};
