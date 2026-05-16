const { Router } = require('express');
const {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeCourses,
} = require('../controllers/employee.controllers');
const {
    getEmployeeOnboardings,
} = require('../controllers/employee.onboarding.controller');
const employeeRouter = Router();

employeeRouter.get('/', getAllEmployees);
employeeRouter.get('/:id/courses', getEmployeeCourses);
employeeRouter.get('/:id/onboardings', getEmployeeOnboardings);
employeeRouter.get('/:id', getEmployeeById);
employeeRouter.post('/', createEmployee);
employeeRouter.patch('/:id', updateEmployee);
employeeRouter.delete('/:id', deleteEmployee);

module.exports = employeeRouter;