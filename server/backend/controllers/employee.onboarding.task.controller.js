const {
    EmployeeOnboardingTask,
    EmployeeOnboarding,
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

        const updatePayload = { ...req.body };

        // Si se marca como completada y no vino completedAt, lo seteamos
        if (updatePayload.status === 'COMPLETED' && !updatePayload.completedAt) {
            updatePayload.completedAt = new Date();
        }

        // Si deja de estar completada, limpiamos completedAt
        if (updatePayload.status && updatePayload.status !== 'COMPLETED') {
            updatePayload.completedAt = null;
        }

        await task.update(updatePayload);

        // Buscar todas las tareas del onboarding para recalcular estado general
        const onboardingTasks = await EmployeeOnboardingTask.findAll({
            where: {
                employeeOnboardingId: task.employeeOnboardingId,
            },
        });

        const onboarding = await EmployeeOnboarding.findByPk(task.employeeOnboardingId);

        if (!onboarding) {
            return res.status(404).json({
                message: 'Parent employee onboarding not found',
            });
        }

        const allCompleted = onboardingTasks.every(
            (onboardingTask) => onboardingTask.status === 'COMPLETED'
        );

        const allPending = onboardingTasks.every(
            (onboardingTask) => onboardingTask.status === 'PENDING'
        );

        if (allCompleted) {
            await onboarding.update({
                status: 'COMPLETED',
                completedAt: new Date(),
            });
        } else if (allPending) {
            await onboarding.update({
                status: 'PENDING',
                completedAt: null,
            });
        } else {
            await onboarding.update({
                status: 'IN_PROGRESS',
                completedAt: null,
            });
        }

        const updatedTask = await EmployeeOnboardingTask.findByPk(id, {
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

        return res.status(200).json(updatedTask);
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