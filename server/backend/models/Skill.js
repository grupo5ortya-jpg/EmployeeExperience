
const { DataTypes } = require('sequelize');

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
				type: DataTypes.ENUM('hard', 'soft'),
				allowNull: false,
			},
			levels: {
				type: DataTypes.JSONB,
				allowNull: false,
				defaultValue: [],
				validate: {
					isValidLevels(value) {
						if (!Array.isArray(value)) {
							throw new Error('levels debe ser un array');
						}
						value.forEach((level, index) => {
							if (
								typeof level !== 'object' ||
								!level.name ||
								typeof level.order !== 'number'
							) {
								throw new Error(
									`Nivel inválido en posición ${index}`
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
			timestamps: true,
			paranoid: true,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};
