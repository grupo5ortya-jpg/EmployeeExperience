
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const employeeTasks = require('../controllers/employee_task.controllers');

// Composite PK: employeeId + taskId
router.get('/',                                   employeeTasks.getAllEmployeeTasks);
router.get('/:employeeId/:taskId',                employeeTasks.getEmployeeTaskById);
router.post('/',                                  authorize('Talento'), employeeTasks.createEmployeeTask);
// PATCH sin authorize por rol: el propio empleado actualiza el estado de su tarea (MyTasks) y
// Talento/Líder aprueban tareas de otros — ownership check dentro del controller.
router.patch('/:employeeId/:taskId',              employeeTasks.updateEmployeeTask);
router.delete('/:employeeId/:taskId',             authorize('Talento'), employeeTasks.deleteEmployeeTask);

module.exports = router;
