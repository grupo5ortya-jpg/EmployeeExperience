const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('Asset',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(150),
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},
			serial_number: {
				type: DataTypes.STRING(150),
				allowNull: true,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: 'Asset',
			tableName: 'assets',
			timestamps: true,
			paranoid: true,
			schema: process.env.DB_SCHEMA || 'public',
			indexes: [
				{
					unique: true,
					fields: ['name', 'serial_number'],
				},
			],
			hooks: {
				beforeDestroy: async (asset, options) => {
					const EmployeeAsset = sequelize.models.EmployeeAsset;

					const assignment = await EmployeeAsset.findOne({
						where: {
							asset_id: asset.id,
							return_date: null
						},
						transaction: options.transaction,
					});

					if (assignment) {
						throw new Error(
							'No se puede eliminar el activo porque está asignado a un empleado.'
						);
					}
				},
			},
		}
	);
};
