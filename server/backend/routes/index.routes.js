
const { Router } = require('express');
const router = Router();
const users = require("./users.routes.js");
const employeeRouter = require('./employee.routes');
const courseRouter = require('./course.routes');
const courseEnrollmentRouter = require('./course.enrollment.routes.js');
const onboardingTemplateRouter = require('./onboarding.template.routes.js');
const employeeOnboardingRouter = require('./employee.onboarding.routes.js');
const employeeOnboardingTaskRouter = require('./employee.onboarding.task.routes.js');
const onboardingTemplateTaskRouter = require('./onboarding.template.task.routes.js');
// Mount routes
//* User - Services
router.use('/', users);
router.use('/employees', employeeRouter);
router.use('/courses', courseRouter);
router.use('/course-enrollments', courseEnrollmentRouter);
router.use('/onboarding-templates', onboardingTemplateRouter);
router.use('/onboarding-template-tasks', onboardingTemplateTaskRouter);
router.use('/employee-onboardings', employeeOnboardingRouter);
router.use('/employee-onboarding-tasks', employeeOnboardingTaskRouter);


module.exports = router;
