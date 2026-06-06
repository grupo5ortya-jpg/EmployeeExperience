
const { Router }    = require('express');
const router        = Router();
const employees     = require('../controllers/employee.controllers');
const { authorize } = require('../middleware/authorize');

router.get('/',              employees.getAllEmployees);
router.get('/:id',           employees.getEmployeeById);
router.post('/',             authorize('Talento'), employees.createEmployee);
router.patch('/:id/mentor',  authorize('Talento'), employees.assignMentor);
router.patch('/:id/leader',  authorize('Talento'), employees.assignLeader);
router.patch('/:id',         authorize('Talento'), employees.updateEmployee);
router.delete('/:id',        authorize('Talento'), employees.deleteEmployee);

module.exports = router;
