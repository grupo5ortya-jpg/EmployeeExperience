
const { DataTypes } = require('sequelize');
const { PERSON } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	sequelize.define('Person',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			first_name: {
				type: DataTypes.STRING(100),
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},
			last_name: {
				type: DataTypes.STRING(100),
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},
			document_type: {
				type: DataTypes.ENUM(...Object.values(PERSON.DOCUMENT_TYPES)),
				allowNull: false,
			},
			document_number: {
				type: DataTypes.STRING(50),
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},
			birth_date: {
				type: DataTypes.DATEONLY,
				allowNull: true,
			},
			phone: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			address: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			emergency_contact_name: {
				type: DataTypes.STRING(120),
				allowNull: true,
			},
			emergency_contact_phone: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			personal_email: {
				type: DataTypes.STRING(150),
				allowNull: true,
				validate: {
					isEmail: true,
				},
			},
		},
		{
			sequelize,
			modelName: 'Person',
			tableName: 'persons',
			timestamps: false,
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};
