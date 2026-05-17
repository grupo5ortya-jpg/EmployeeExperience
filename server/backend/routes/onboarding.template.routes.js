const { Router } = require('express');
const {
    getAllOnboardingTemplates,
    getOnboardingTemplateById, createOnboardingTemplate
} = require('../controllers/onboarding.template.controller');


const onboardingTemplateRouter = Router();

onboardingTemplateRouter.get('/', getAllOnboardingTemplates);
onboardingTemplateRouter.get('/:id', getOnboardingTemplateById);
onboardingTemplateRouter.post('/', createOnboardingTemplate);

module.exports = onboardingTemplateRouter;