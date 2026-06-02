
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('Department',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true,
				validate: {
					notEmpty: true,
				},
			}
		},
		{
			sequelize,
			modelName: 'Department',
			tableName: 'departments',
			timestamps: true,
			paranoid: true,
			schema: process.env.DB_SCHEMA || 'public',
			hooks: {
				beforeDestroy: async (department, options) => {
					const Employee = sequelize.models.Employee;

					const employee = await Employee.findOne({
						where: {
							department_id: department.id,
						},
						transaction: options.transaction,
					});

					if (employee) {
						throw new Error(
							'No se puede eliminar el departamento porque tiene empleados asignados.'
						);
					}
				},
			},
		}
	);
};


