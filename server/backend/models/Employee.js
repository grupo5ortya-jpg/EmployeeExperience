
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	const Employee = sequelize.define('Employee',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			person_id: {
				type: DataTypes.UUID,
				allowNull: false,
				unique: true,
			},
			department_id: {
				type: DataTypes.UUID,
				allowNull: true
			},
			position: {
				type: DataTypes.STRING(120),
				allowNull: true,
			},
			hire_date: {
				type: DataTypes.DATEONLY,
				allowNull: true,
			},
			status: {
				type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
				allowNull: false,
				defaultValue: 'ACTIVE',
			},
		},
		{
			sequelize,
			modelName: 'Employee',
			tableName: 'employees',
			timestamps: false,
			schema: process.env.DB_SCHEMA || 'public',
			hooks: {
				afterCreate: async (employee, options) => {
					const EmployeeHistory = sequelize.models.EmployeeHistory;
					if (!EmployeeHistory || !employee.department_id) return;

					await EmployeeHistory.create({
						employee_id: employee.id,
						department_id: employee.department_id,
						position: employee.position,
						start_date: employee.hire_date || new Date().toISOString().slice(0, 10),
					}, { transaction: options.transaction });
				},

				afterUpdate: async (employee, options) => {
					if (!employee.changed('department_id') && !employee.changed('position')) return;

					const EmployeeHistory = sequelize.models.EmployeeHistory;
					if (!EmployeeHistory) return;

					const transaction = options.transaction;
					const closeDate = new Date().toISOString().slice(0, 10);

					await EmployeeHistory.update(
						{ end_date: closeDate },
						{
							where: {
								employee_id: employee.id,
								end_date: null,
							},
							transaction,
						}
					);

					if (!employee.department_id) return;

					await EmployeeHistory.create({
						employee_id: employee.id,
						department_id: employee.department_id,
						position: employee.position,
						start_date: closeDate,
					}, { transaction });
				},
			},
		}
	);

	return Employee;
};
