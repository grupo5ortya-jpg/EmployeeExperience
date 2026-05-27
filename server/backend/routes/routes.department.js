
const { Router } = require('express');
const router = Router();
const departments = require('../controllers/department.controllers');

router.get('/', departments.getAllActiveDepartments);
router.get('/:id', departments.getDepartmentById);
router.post('/', departments.createDepartment);
router.patch('/:id', departments.updateDepartment);
router.delete('/:id', departments.deleteDepartment);

module.exports = router;
