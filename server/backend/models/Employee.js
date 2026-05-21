
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('Employee',
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
			status: {
				type: DataTypes.ENUM('ACTIVE', ' '),
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
	)
};
