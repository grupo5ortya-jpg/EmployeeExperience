
const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authorize');
const {
    core_ctrl_get_skills,
    core_ctrl_create_skill,
    core_ctrl_get_skill_by_id,
    core_ctrl_update_skill,
    core_ctrl_delete_skill
} = require('../controllers/skill.controller');


router.get('/',       core_ctrl_get_skills);
router.post('/',      authorize('Talento'), core_ctrl_create_skill);
router.get('/:id',    core_ctrl_get_skill_by_id);
router.patch('/:id',  authorize('Talento'), core_ctrl_update_skill);
router.delete('/:id', authorize('Talento'), core_ctrl_delete_skill);


module.exports = router;
