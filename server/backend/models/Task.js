
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');


class Task extends Model { }

Task.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		task_type_id: {
			type: DataTypes.UUID,
			allowNull: false
		},
		estimated_duration: {
			type: DataTypes.INTEGER,
			allowNull: true,
			validate: {
				min: 0,
			},
			comment: 'Estimated duration in days',
		}
	},
	{
		sequelize,
		modelName: 'Task',
		tableName: 'tasks',
		timestamps: false,
		paranoid: true,
		uniqueKeys: {
			unique_name_type: {
				fields: ['name', 'task_type_id'],
			},
		},
		schema: process.env.DB_SCHEMA || 'public',
	}
);


module.exports = Task;
