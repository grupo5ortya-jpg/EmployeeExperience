
const { Router } = require('express');
const router = Router();
const {
	core_ctrl_get_roles_all,
	core_ctrl_get_active_roles,
	core_ctrl_get_role_by_id
} = require('../controllers/role.controllers');


router.get('/',       core_ctrl_get_roles_all);
router.get('/active', core_ctrl_get_active_roles);
router.get('/:id',    core_ctrl_get_role_by_id);


module.exports = router;
