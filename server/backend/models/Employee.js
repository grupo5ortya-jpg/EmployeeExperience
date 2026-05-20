
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');


class Employee extends Model { }

Employee.init(
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
			allowNull: false,
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
	}
);


module.exports = Employee;
