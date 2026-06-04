
const { DataTypes } = require('sequelize');
const { ROLE, EMPLOYEE } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {

	const syncEmployeeStatus = async (user, transaction) => {
		const Role = sequelize.models.Role;
		const Employee = sequelize.models.Employee;

		if (!Role || !Employee || !user.employee_id) return;

		const role = await Role.findByPk(user.role_id, { transaction });

		if (!role) return;

		const employee = await Employee.findByPk(user.employee_id, {
			transaction,
		});

		if (!employee) return;

		if (ROLE.INACTIVE_ROLES.includes(role.name)) {
			await employee.update(
				{
					status: EMPLOYEE.STATUS_INACTIVE,
					department_id: null,
					position: null,
				},
				{ transaction }
			);
		} else {
			await employee.update(
				{
					status: EMPLOYEE.STATUS_ACTIVE,
				},
				{ transaction }
			);
		}
	};


	sequelize.define('User',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			email: {
				type: DataTypes.STRING(120),
				allowNull: false,
				unique: true,
				validate: {
					isEmail: true,
					notEmpty: true,
				},
			},
			passwordHash: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			role_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			employee_id: {
				type: DataTypes.UUID,
				allowNull: true,
			},
			auth0Id: {
				type: DataTypes.STRING,
				allowNull: true,//hasta que implementemos auth0
				unique: true,
			},
		},
		{
			sequelize,
			modelName: 'User',
			tableName: 'users',
			timestamps: true,
			schema: process.env.DB_SCHEMA || 'public',
			hooks: {
				afterCreate: async (user, options) => {
					await syncEmployeeStatus(
						user,
						options.transaction
					);
				},
				afterUpdate: async (user, options) => {
					if (!user.changed('role_id')) return;

					await syncEmployeeStatus(
						user,
						options.transaction
					);
				},
			},
		}
	);
};
