const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define(
        'JobOpening',
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
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },

            status: {
                type: DataTypes.ENUM('open', 'closed'),
                defaultValue: 'open',
            },
        },
        {
            sequelize,
            modelName: 'JobOpening',
            tableName: 'job_openings',
            timestamps: true,
            paranoid: true,
            schema: process.env.DB_SCHEMA || 'public',
        }
    );
};