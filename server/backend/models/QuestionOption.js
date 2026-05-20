
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');


class QuestionOption extends Model {}

QuestionOption.init(
{
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	question_id: {
		type: DataTypes.UUID,
		allowNull: false
	},
	label: {
		type: DataTypes.STRING(255),
		allowNull: false,
	},
	value: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	order: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
	},
},
{
	sequelize,
	modelName: 'QuestionOption',
	tableName: 'question_options',
	timestamps: false,
	paranoid: true,
	schema: process.env.DB_SCHEMA || 'public',
}
);


module.exports = QuestionOption;
