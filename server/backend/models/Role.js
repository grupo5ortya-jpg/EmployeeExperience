
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('Role',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(50),
				allowNull: false,
				unique: true,
				validate: {
					notEmpty: true,
				},
			}
		},
		{
			sequelize,
			modelName: 'Role',
			tableName: 'roles',
			timestamps: false,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};
