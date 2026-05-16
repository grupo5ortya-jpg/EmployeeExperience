const { Router } = require('express');
const {
    getEmployeeOnboardingById,
    getEmployeeOnboardingTasks,
    createEmployeeOnboarding,
    updateEmployeeOnboarding,
} = require('../controllers/employee.onboarding.controller');

const employeeOnboardingRouter = Router();

employeeOnboardingRouter.get('/:id/tasks', getEmployeeOnboardingTasks);
employeeOnboardingRouter.get('/:id', getEmployeeOnboardingById);
employeeOnboardingRouter.post('/', createEmployeeOnboarding);
employeeOnboardingRouter.patch('/:id', updateEmployeeOnboarding);

module.exports = employeeOnboardingRouter;