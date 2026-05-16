const sequelize = require('../connection/sequelize');

const Role = require('./Role');
const User = require('./User');
const UserRole = require('./UserRole');
const Department = require('./Department');
const Employee = require('./Employee');
const Course = require('./Course');
const CourseEnrollment = require('./CourseEnrollment');
const OnboardingTemplate = require('./OnboardingTemplate');
const OnboardingTemplateTask = require('./OnboardingTemplateTask');
const EmployeeOnboarding = require('./EmployeeOnboarding');
const EmployeeOnboardingTask = require('./EmployeeOnboardingTask');

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
    // OnboardingTemplate -> OnboardingTemplateTask
    OnboardingTemplate.hasMany(OnboardingTemplateTask, {
        foreignKey: 'templateId',
        as: 'tasks',
    });

    OnboardingTemplateTask.belongsTo(OnboardingTemplate, {
        foreignKey: 'templateId',
        as: 'template',
    });

    // Employee -> EmployeeOnboarding
    Employee.hasMany(EmployeeOnboarding, {
        foreignKey: 'employeeId',
        as: 'onboardings',
    });

    EmployeeOnboarding.belongsTo(Employee, {
        foreignKey: 'employeeId',
        as: 'employee',
    });

    // OnboardingTemplate -> EmployeeOnboarding
    OnboardingTemplate.hasMany(EmployeeOnboarding, {
        foreignKey: 'templateId',
        as: 'employeeOnboardings',
    });

    EmployeeOnboarding.belongsTo(OnboardingTemplate, {
        foreignKey: 'templateId',
        as: 'template',
    });

    // EmployeeOnboarding -> EmployeeOnboardingTask
    EmployeeOnboarding.hasMany(EmployeeOnboardingTask, {
        foreignKey: 'employeeOnboardingId',
        as: 'tasks',
    });

    EmployeeOnboardingTask.belongsTo(EmployeeOnboarding, {
        foreignKey: 'employeeOnboardingId',
        as: 'employeeOnboarding',
    });

    // OnboardingTemplateTask -> EmployeeOnboardingTask
    OnboardingTemplateTask.hasMany(EmployeeOnboardingTask, {
        foreignKey: 'templateTaskId',
        as: 'employeeTasks',
    });

    EmployeeOnboardingTask.belongsTo(OnboardingTemplateTask, {
        foreignKey: 'templateTaskId',
        as: 'templateTask',
    });

    // Employee -> EmployeeOnboardingTask (assigned user)
    Employee.hasMany(EmployeeOnboardingTask, {
        foreignKey: 'assignedToEmployeeId',
        as: 'assignedOnboardingTasks',
    });

    EmployeeOnboardingTask.belongsTo(Employee, {
        foreignKey: 'assignedToEmployeeId',
        as: 'assignedTo',
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
    OnboardingTemplate,
    OnboardingTemplateTask,
    EmployeeOnboarding,
    EmployeeOnboardingTask,
};