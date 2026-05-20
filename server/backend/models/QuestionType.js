
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');


class QuestionType extends Model { }

QuestionType.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		sub_type: {
			type: DataTypes.STRING(100),
			allowNull: true,
		}
	},
	{
		sequelize,
		modelName: 'QuestionType',
		tableName: 'question_types',
		timestamps: false,
		paranoid: true,
		uniqueKeys: {
			unique_name_subtype: {
				fields: ['name', 'sub_type'],
			},
		},
		schema: process.env.DB_SCHEMA || 'public',
	}
);


module.exports = QuestionType;
