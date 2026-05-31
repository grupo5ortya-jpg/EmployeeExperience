const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define(
        'Skill',
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

            type: {
                type: DataTypes.ENUM('hard', 'soft'),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Skill',
            tableName: 'skills',
            timestamps: true,
            paranoid: true,
            schema: process.env.DB_SCHEMA || 'public',
        }
    );
};