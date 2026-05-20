
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');

class User extends Model { }

User.init(
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
	}
);


module.exports = User;
