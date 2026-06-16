
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
	const AlumniProfile = sequelize.define('AlumniProfile',
		{
			employee_id: {
				type: DataTypes.UUID,
				allowNull: false,
				primaryKey: true,
			},
			rehirable: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: true,
			},
			tags: {
				type: DataTypes.JSONB,
				allowNull: false,
				defaultValue: [],
			},
		},
		{
			sequelize,
			modelName: 'AlumniProfile',
			tableName: 'alumni_profiles',
			timestamps: true,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);

	AlumniProfile.removeAttribute('id');

	return AlumniProfile;
};
