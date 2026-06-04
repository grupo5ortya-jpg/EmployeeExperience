
const { DataTypes } = require('sequelize');
const { MODEL_ROLE } = require('../utils/constants');


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
					isValidRole(value) {
						const allRoles = [...MODEL_ROLE.ACTIVE_ROLES, ...MODEL_ROLE.INACTIVE_ROLES];
						if (!allRoles.includes(value)) {
							throw new Error(
								`Role must be one of: ${allRoles.join(', ')}`
							);
						}
					}
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
