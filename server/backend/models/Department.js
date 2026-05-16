const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');

class Department extends Model { }

Department.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'Department',
        tableName: 'departments',
        timestamps: true,
    }
);

module.exports = Department;