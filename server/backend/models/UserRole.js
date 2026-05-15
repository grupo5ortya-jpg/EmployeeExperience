const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');

class UserRole extends Model { }

UserRole.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        roleId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'UserRole',
        tableName: 'userRoles',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['userId', 'roleId'],
            },
        ],
    }
);

module.exports = UserRole;