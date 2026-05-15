const { Router } = require('express');
const {
    updateEmployeeOnboardingTask,
} = require('../controllers/employee.onboarding.task.controller');

const employeeOnboardingTaskRouter = Router();

employeeOnboardingTaskRouter.patch('/:id', updateEmployeeOnboardingTask);

module.exports = employeeOnboardingTaskRouter;