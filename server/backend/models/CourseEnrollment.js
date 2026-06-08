
const { DataTypes } = require('sequelize');
const { COURSE_ENROLLMENT } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	sequelize.define('CourseEnrollment',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			employee_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			course_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			progress: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
				validate: {
					min: 0,
					max: 100,
				},
			},
			status: {
				type: DataTypes.ENUM(...Object.values(COURSE_ENROLLMENT.STATUS)),
				defaultValue: COURSE_ENROLLMENT.STATUS_IN_PROGRESS,
			},
			certificate_link: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: 'CourseEnrollment',
			tableName: 'course_enrollments',
			timestamps: true,
			paranoid: true,
			schema: process.env.DB_SCHEMA || 'public',
			indexes: [
				{
					unique: true,
					fields: ['employee_id', 'course_id'],
				},
			],
		}
	);
};
