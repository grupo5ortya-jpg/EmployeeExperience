
const { Router } = require('express');
const router = Router();
const roles = require('../controllers/role.controllers');

router.get('/',       roles.getAllRoles);
router.get('/:id',    roles.getRoleById);
router.post('/',      roles.createRole);
router.patch('/:id',  roles.updateRole);
router.delete('/:id', roles.deleteRole);

module.exports = router;
