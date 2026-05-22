
const { Router } = require('express');
const router = Router();
const employeeTasks = require('../controllers/employee_task.controllers');

// Composite PK: employeeId + taskId
router.get('/',                                   employeeTasks.getAllEmployeeTasks);
router.get('/:employeeId/:taskId',                employeeTasks.getEmployeeTaskById);
router.post('/',                                  employeeTasks.createEmployeeTask);
router.patch('/:employeeId/:taskId',              employeeTasks.updateEmployeeTask);
router.delete('/:employeeId/:taskId',             employeeTasks.deleteEmployeeTask);

module.exports = router;
