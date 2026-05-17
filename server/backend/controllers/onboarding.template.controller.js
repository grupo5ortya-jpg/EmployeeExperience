const { OnboardingTemplate, OnboardingTemplateTask } = require('../models');

const getAllOnboardingTemplates = async (req, res) => {
    try {
        const templates = await OnboardingTemplate.findAll({
            include: [
                {
                    model: OnboardingTemplateTask,
                    as: 'tasks',
                    attributes: [
                        'id',
                        'title',
                        'description',
                        'responsibleRole',
                        'dueInDays',
                        'sortOrder',
                    ],
                },
            ],
            order: [
                ['createdAt', 'ASC'],
                [{ model: OnboardingTemplateTask, as: 'tasks' }, 'sortOrder', 'ASC'],
            ],
        });

        return res.status(200).json(templates);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch onboarding templates',
            error: error.message,
        });
    }
};

const getOnboardingTemplateById = async (req, res) => {
    try {
        const { id } = req.params;

        const template = await OnboardingTemplate.findByPk(id, {
            include: [
                {
                    model: OnboardingTemplateTask,
                    as: 'tasks',
                    attributes: [
                        'id',
                        'title',
                        'description',
                        'responsibleRole',
                        'dueInDays',
                        'sortOrder',
                    ],
                },
            ],
            order: [[{ model: OnboardingTemplateTask, as: 'tasks' }, 'sortOrder', 'ASC']],
        });

        if (!template) {
            return res.status(404).json({
                message: 'Onboarding template not found',
            });
        }

        return res.status(200).json(template);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch onboarding template',
            error: error.message,
        });
    }
};

const createOnboardingTemplate = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;

        const newTemplate = await OnboardingTemplate.create({
            name,
            description,
            isActive,
        });

        return res.status(201).json(newTemplate);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create onboarding template',
            error: error.message,
        });
    }
};

module.exports = {
    getAllOnboardingTemplates,
    getOnboardingTemplateById,
    createOnboardingTemplate,
};