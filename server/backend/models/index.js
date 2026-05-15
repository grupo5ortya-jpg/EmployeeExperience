const sequelize = require('../connection/sequelize');

const Role = require('./Role');
const User = require('./User');
const UserRole = require('./UserRole');
const Department = require('./Department');
const Employee = require('./Employee');
const Course = require('./Course');
const CourseEnrollment = require('./CourseEnrollment');

const applyAssociations = () => {
    // User <-> Role (N:M)
    User.belongsToMany(Role, {
        through: UserRole,
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: 'roles',
    });

    Role.belongsToMany(User, {
        through: UserRole,
        foreignKey: 'roleId',
        otherKey: 'userId',
        as: 'users',
    });

    UserRole.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
    });

    UserRole.belongsTo(Role, {
        foreignKey: 'roleId',
        as: 'role',
    });

    User.hasMany(UserRole, {
        foreignKey: 'userId',
        as: 'userRoles',
    });

    Role.hasMany(UserRole, {
        foreignKey: 'roleId',
        as: 'userRoles',
    });

    // User -> Employee (1:1)
    User.hasOne(Employee, {
        foreignKey: 'userId',
        as: 'employee',
    });

    Employee.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
    });

    // Department -> Employee (1:N)
    Department.hasMany(Employee, {
        foreignKey: 'departmentId',
        as: 'employees',
    });

    Employee.belongsTo(Department, {
        foreignKey: 'departmentId',
        as: 'department',
    });

    // Employee -> Employee (manager / directReports)
    Employee.belongsTo(Employee, {
        foreignKey: 'managerId',
        as: 'manager',
    });

    Employee.hasMany(Employee, {
        foreignKey: 'managerId',
        as: 'directReports',
    });

    // Employee <-> Course via CourseEnrollment
    Employee.belongsToMany(Course, {
        through: CourseEnrollment,
        foreignKey: 'employeeId',
        otherKey: 'courseId',
        as: 'courses',
    });

    Course.belongsToMany(Employee, {
        through: CourseEnrollment,
        foreignKey: 'courseId',
        otherKey: 'employeeId',
        as: 'employees',
    });

    CourseEnrollment.belongsTo(Employee, {
        foreignKey: 'employeeId',
        as: 'employee',
    });

    CourseEnrollment.belongsTo(Course, {
        foreignKey: 'courseId',
        as: 'course',
    });

    Employee.hasMany(CourseEnrollment, {
        foreignKey: 'employeeId',
        as: 'courseEnrollments',
    });

    Course.hasMany(CourseEnrollment, {
        foreignKey: 'courseId',
        as: 'courseEnrollments',
    });
};

applyAssociations();

module.exports = {
    sequelize,
    Role,
    User,
    UserRole,
    Department,
    Employee,
    Course,
    CourseEnrollment,
};