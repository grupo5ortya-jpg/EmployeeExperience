
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {

	const EmployeeSkill = sequelize.define('EmployeeSkill',
		{
			employee_id: {
				type: DataTypes.UUID,
				allowNull: false,
				primaryKey: true
			},
			skill_id: {
				type: DataTypes.UUID,
				allowNull: false,
				primaryKey: true
			},
			level: {
				type: DataTypes.INTEGER,
				allowNull: false,
			}
		}, {
			sequelize,
			modelName: 'EmployeeSkill',
			tableName: 'employee_skills',
			timestamps: true,
			paranoid: true,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);

	EmployeeSkill.removeAttribute('id');

	return EmployeeSkill;
};