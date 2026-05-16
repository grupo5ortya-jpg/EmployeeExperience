const { Router } = require('express');
const {
    getAllOnboardingTemplates,
    getOnboardingTemplateById,
} = require('../controllers/onboarding.template.controller');

const onboardingTemplateRouter = Router();

onboardingTemplateRouter.get('/', getAllOnboardingTemplates);
onboardingTemplateRouter.get('/:id', getOnboardingTemplateById);

module.exports = onboardingTemplateRouter;