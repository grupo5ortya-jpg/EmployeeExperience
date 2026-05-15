const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');

class EmployeeOnboarding extends Model { }

EmployeeOnboarding.init(
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
        templateId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED'),
            allowNull: false,
            defaultValue: 'PENDING',
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'EmployeeOnboarding',
        tableName: 'employeeOnboardings',
        timestamps: true,
    }
);

module.exports = EmployeeOnboarding;