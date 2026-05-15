const {
    Employee,
    EmployeeOnboarding,
    EmployeeOnboardingTask,
    OnboardingTemplate,
    OnboardingTemplateTask,
} = require('../models');

const getEmployeeOnboardings = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findByPk(id, {
            attributes: ['id', 'firstName', 'lastName', 'fullName', 'position', 'status'],
            include: [
                {
                    model: EmployeeOnboarding,
                    as: 'onboardings',
                    include: [
                        {
                            model: OnboardingTemplate,
                            as: 'template',
                            attributes: ['id', 'name', 'description', 'isActive'],
                        },
                    ],
                },
            ],
            order: [[{ model: EmployeeOnboarding, as: 'onboardings' }, 'createdAt', 'DESC']],
        });

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found',
            });
        }

        return res.status(200).json(employee);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch employee onboardings',
            error: error.message,
        });
    }
};

const getEmployeeOnboardingById = async (req, res) => {
    try {
        const { id } = req.params;

        const employeeOnboarding = await EmployeeOnboarding.findByPk(id, {
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'firstName', 'lastName', 'fullName', 'position', 'status'],
                },
                {
                    model: OnboardingTemplate,
                    as: 'template',
                    attributes: ['id', 'name', 'description', 'isActive'],
                },
                {
                    model: EmployeeOnboardingTask,
                    as: 'tasks',
                    include: [
                        {
                            model: Employee,
                            as: 'assignedTo',
                            attributes: ['id', 'firstName', 'lastName', 'fullName', 'position'],
                        },
                        {
                            model: OnboardingTemplateTask,
                            as: 'templateTask',
                            attributes: ['id', 'title', 'responsibleRole', 'dueInDays', 'sortOrder'],
                        },
                    ],
                },
            ],
            order: [[{ model: EmployeeOnboardingTask, as: 'tasks' }, 'dueDate', 'ASC']],
        });

        if (!employeeOnboarding) {
            return res.status(404).json({
                message: 'Employee onboarding not found',
            });
        }

        return res.status(200).json(employeeOnboarding);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch employee onboarding',
            error: error.message,
        });
    }
};

const getEmployeeOnboardingTasks = async (req, res) => {
    try {
        const { id } = req.params;

        const employeeOnboarding = await EmployeeOnboarding.findByPk(id, {
            attributes: ['id', 'employeeId', 'templateId', 'startDate', 'status', 'completedAt'],
            include: [
                {
                    model: EmployeeOnboardingTask,
                    as: 'tasks',
                    include: [
                        {
                            model: Employee,
                            as: 'assignedTo',
                            attributes: ['id', 'firstName', 'lastName', 'fullName', 'position'],
                        },
                        {
                            model: OnboardingTemplateTask,
                            as: 'templateTask',
                            attributes: ['id', 'title', 'responsibleRole', 'dueInDays', 'sortOrder'],
                        },
                    ],
                },
            ],
            order: [[{ model: EmployeeOnboardingTask, as: 'tasks' }, 'dueDate', 'ASC']],
        });

        if (!employeeOnboarding) {
            return res.status(404).json({
                message: 'Employee onboarding not found',
            });
        }

        return res.status(200).json(employeeOnboarding);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch employee onboarding tasks',
            error: error.message,
        });
    }
};

const createEmployeeOnboarding = async (req, res) => {
    try {
        const {
            employeeId,
            templateId,
            startDate,
            status,
            completedAt,
        } = req.body;

        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found',
            });
        }

        const template = await OnboardingTemplate.findByPk(templateId);
        if (!template) {
            return res.status(404).json({
                message: 'Onboarding template not found',
            });
        }

        const newEmployeeOnboarding = await EmployeeOnboarding.create({
            employeeId,
            templateId,
            startDate,
            status,
            completedAt,
        });

        return res.status(201).json(newEmployeeOnboarding);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create employee onboarding',
            error: error.message,
        });
    }
};

const updateEmployeeOnboarding = async (req, res) => {
    try {
        const { id } = req.params;

        const employeeOnboarding = await EmployeeOnboarding.findByPk(id);

        if (!employeeOnboarding) {
            return res.status(404).json({
                message: 'Employee onboarding not found',
            });
        }

        await employeeOnboarding.update(req.body);

        return res.status(200).json(employeeOnboarding);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update employee onboarding',
            error: error.message,
        });
    }
};

module.exports = {
    getEmployeeOnboardings,
    getEmployeeOnboardingById,
    getEmployeeOnboardingTasks,
    createEmployeeOnboarding,
    updateEmployeeOnboarding,
};