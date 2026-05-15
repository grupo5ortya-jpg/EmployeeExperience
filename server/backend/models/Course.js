const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');


class Course extends Model { }

Course.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(150),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        durationHours: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0,
            },
        },
        modality: {
            type: DataTypes.ENUM('ASYNC', 'LIVE', 'HYBRID'),
            allowNull: false,
        },
        provider: {
            type: DataTypes.STRING(120),
            allowNull: true,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isUrl: true,
            },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'Course',
        tableName: 'courses',
        timestamps: true,
    }
);

module.exports = Course;