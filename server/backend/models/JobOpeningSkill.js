const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define(
        'JobOpeningSkill',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },

            jobOpeningId: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            skillId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            requiredLevel: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 3,
                validate: {
                    min: 1,
                    max: 5,
                },
            },
        },
        {
            sequelize,
            modelName: 'JobOpeningSkill',
            tableName: 'job_opening_skills',
            timestamps: true,
            paranoid: true,
            schema: process.env.DB_SCHEMA || 'public',
        }
    );
};