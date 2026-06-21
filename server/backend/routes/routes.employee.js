
const { Router }    = require('express');
const router        = Router();
const employees     = require('../controllers/employee.controllers');
const { authorize } = require('../middlewares/authorize');

router.get('/',              employees.getAllEmployees);
router.get('/:id',           employees.getEmployeeById);
router.post('/',             authorize('Talento'), employees.createEmployee);
router.patch('/:id/mentor',  authorize('Talento'), employees.assignMentor);
router.patch('/:id/leader',  authorize('Talento'), employees.assignLeader);
router.patch('/:id/assets/:assetId/return', authorize('Talento'), employees.returnAsset);
// Talento puede editar a cualquiera; Líder/Colaborador solo a sí mismos (campos restringidos, ver controller)
router.patch('/:id',         authorize('Talento', 'Líder', 'Colaborador'), employees.updateEmployee);
router.delete('/:id',        authorize('Talento'), employees.deleteEmployee);

module.exports = router;
