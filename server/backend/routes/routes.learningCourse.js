const express = require('express');
const router = express.Router();

const {
    core_ctrl_get_courses,
    core_ctrl_get_course_by_id,
    core_ctrl_create_course,
    core_ctrl_update_course,
    core_ctrl_delete_course,
} = require('../controllers/learningCourse.controller');

router.get('/', core_ctrl_get_courses);
router.get('/:id', core_ctrl_get_course_by_id);
router.post('/', core_ctrl_create_course);
router.patch('/:id', core_ctrl_update_course);
router.delete('/:id', core_ctrl_delete_course);

module.exports = router;
