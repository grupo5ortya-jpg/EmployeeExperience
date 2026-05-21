
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('Survey', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		type_id: {
			type: DataTypes.UUID,
			allowNull: false
		},
	}, {
		sequelize,
		modelName: 'Survey',
		tableName: 'surveys',
		schema: process.env.DB_SCHEMA || 'public'
	});
};
