
const { DataTypes } = require('sequelize');
const { SKILL } = require('../utils/constants/models.constants.js');
const { SKILL_ERR } = require('../utils/constants/messages.constants.js').ERRORS.MODEL;;


module.exports = (sequelize) => {
	sequelize.define(
		'Skill',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true,
				validate: {
					notEmpty: true,
				},
			},
			type: {
				type: DataTypes.ENUM(...Object.values(SKILL.TYPES)),
				allowNull: false,
			},
			levels: {
				type: DataTypes.JSONB,
				allowNull: false,
				defaultValue: [],
				validate: {
					isValidLevels(value) {
						if (!Array.isArray(value)) {
							throw new Error(SKILL_ERR.LEVELS_MUST_BE_ARRAY);
						}
						value.forEach((level, index) => {
							if (
								typeof level !== 'object' ||
								!level.name ||
								typeof level.order !== 'number'
							) {
								throw new Error(
									SKILL_ERR.INVALID_LEVEL_AT_POSITION(index)
								);
							}
						});
					},
				},
			},
		},
		{
			sequelize,
			modelName: 'Skill',
			tableName: 'skills',
			timestamps: false,
			paranoid: false,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};
