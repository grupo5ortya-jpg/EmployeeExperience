const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');


class CourseEnrollment extends Model { }

CourseEnrollment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        employeeId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        courseId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED'),
            allowNull: false,
            defaultValue: 'ENROLLED',
        },
        progressPercent: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100,
            },
        },
        enrolledAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'CourseEnrollment',
        tableName: 'courseEnrollments',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['employeeId', 'courseId'],
            },
        ],
    }
);

module.exports = CourseEnrollment;