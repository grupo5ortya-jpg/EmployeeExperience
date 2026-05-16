const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');

class Role extends Model { }

Role.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
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
    },
    {
        sequelize,
        modelName: 'Role',
        tableName: 'roles',
        timestamps: true,
    }
);

module.exports = Role;