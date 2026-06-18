
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const departments = require('../controllers/department.controllers');

router.get('/', departments.getAllActiveDepartments);
router.get('/:id', departments.getDepartmentById);
router.post('/', authorize('Talento'), departments.createDepartment);
router.patch('/:id', authorize('Talento'), departments.updateDepartment);
router.delete('/:id', authorize('Talento'), departments.deleteDepartment);

module.exports = router;
