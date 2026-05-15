const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');

class EmployeeOnboardingTask extends Model { }

EmployeeOnboardingTask.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        employeeOnboardingId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        templateTaskId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        title: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        assignedToEmployeeId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        dueDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'),
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
        modelName: 'EmployeeOnboardingTask',
        tableName: 'employeeOnboardingTasks',
        timestamps: true,
    }
);

module.exports = EmployeeOnboardingTask;