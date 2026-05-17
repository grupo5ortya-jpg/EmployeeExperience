const {
    OnboardingTemplate,
    OnboardingTemplateTask,
} = require('../models');

const createOnboardingTemplateTask = async (req, res) => {
    try {
        const {
            templateId,
            title,
            description,
            responsibleRole,
            dueInDays,
            sortOrder,
        } = req.body;

        const template = await OnboardingTemplate.findByPk(templateId);

        if (!template) {
            return res.status(404).json({
                message: 'Onboarding template not found',
            });
        }

        const newTask = await OnboardingTemplateTask.create({
            templateId,
            title,
            description,
            responsibleRole,
            dueInDays,
            sortOrder,
        });

        return res.status(201).json(newTask);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create onboarding template task',
            error: error.message,
        });
    }
};

module.exports = {
    createOnboardingTemplateTask,
};