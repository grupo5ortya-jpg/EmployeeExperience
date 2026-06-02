
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	const EmployeeAsset = sequelize.define('EmployeeAsset',
		{
			employee_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			asset_id: {
				type: DataTypes.UUID,
				allowNull: false,
				unique: true,
			},
			assignment_date: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			return_date: {
				type: DataTypes.DATEONLY,
				allowNull: true,
			},
			note: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: 'EmployeeAsset',
			tableName: 'employee_assets',
			timestamps: false,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);

	EmployeeAsset.removeAttribute('id');

	return EmployeeAsset;
};
