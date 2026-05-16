const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');


class Employee extends Model { }

Employee.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
        },
        departmentId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        managerId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        fullName: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.firstName} ${this.lastName}`;
            }
        },
        documentType: {
            type: DataTypes.ENUM('DNI', 'PASAPORTE', 'LC', 'LE', 'CI'),
            allowNull: false,
        },
        documentNumber: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
            },
        },
        birthDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        hireDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        position: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('ONBOARDING', 'ACTIVE', 'OFFBOARDING', 'ALUMNI'),
            allowNull: false,
            defaultValue: 'ONBOARDING',
        },
        phone: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        emergencyContactName: {
            type: DataTypes.STRING(120),
            allowNull: true,
        },
        emergencyContactPhone: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Employee',
        tableName: 'employees',
        timestamps: true,
    }
);

module.exports = Employee;