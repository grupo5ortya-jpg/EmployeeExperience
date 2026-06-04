
const { DataTypes } = require('sequelize');
const { ROLE } = require('../utils/constants/models.constants.js');
const { ROLE_ERR } = require('../utils/constants/messages.constants.js').ERRORS.MODEL;


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
						const allRoles = [...ROLE.ACTIVE_ROLES, ...ROLE.INACTIVE_ROLES];
						if (!allRoles.includes(value)) {
							throw new Error(
								ROLE_ERR.INVALID_ROLE(allRoles)
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
