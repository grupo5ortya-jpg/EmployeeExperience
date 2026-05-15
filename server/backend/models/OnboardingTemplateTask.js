const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');

class OnboardingTemplateTask extends Model { }

OnboardingTemplateTask.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        templateId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(150),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        responsibleRole: {
            type: DataTypes.ENUM('employee', 'leader', 'hr'),
            allowNull: false,
        },
        dueInDays: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
            },
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
            },
        },
    },
    {
        sequelize,
        modelName: 'OnboardingTemplateTask',
        tableName: 'onboardingTemplateTasks',
        timestamps: true,
    }
);

module.exports = OnboardingTemplateTask;