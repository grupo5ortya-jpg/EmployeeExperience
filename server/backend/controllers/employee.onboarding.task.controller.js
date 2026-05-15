const {
    EmployeeOnboardingTask,
    Employee,
    OnboardingTemplateTask,
} = require('../models');

const updateEmployeeOnboardingTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await EmployeeOnboardingTask.findByPk(id, {
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
        });

        if (!task) {
            return res.status(404).json({
                message: 'Employee onboarding task not found',
            });
        }

        await task.update(req.body);

        return res.status(200).json(task);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update employee onboarding task',
            error: error.message,
        });
    }
};

module.exports = {
    updateEmployeeOnboardingTask,
};