const { Router } = require('express');
const {
    createOnboardingTemplateTask,
} = require('../controllers/onboarding.template.task.controller');

const onboardingTemplateTaskRouter = Router();

onboardingTemplateTaskRouter.post('/', createOnboardingTemplateTask);

module.exports = onboardingTemplateTaskRouter;