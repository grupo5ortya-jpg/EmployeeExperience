
const express = require('express');
const router = express.Router();

const { core_ctrl_get_skills, core_ctrl_create_skill } = require('../controllers/skill.controller');

router.get('/', core_ctrl_get_skills);
router.post('/', core_ctrl_create_skill);

module.exports = router;
