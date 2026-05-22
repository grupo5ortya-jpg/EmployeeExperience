
const { Router } = require('express');
const router = Router();
const employees = require('../controllers/employee.controllers');

router.get('/',       employees.getAllEmployees);
router.get('/:id',    employees.getEmployeeById);
router.post('/',      employees.createEmployee);
router.patch('/:id',  employees.updateEmployee);
router.delete('/:id', employees.deleteEmployee);

module.exports = router;
