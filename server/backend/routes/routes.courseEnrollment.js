const express = require('express');
const router = express.Router();

const {
    core_ctrl_get_enrollments,
    core_ctrl_create_enrollment,
    core_ctrl_update_progress,
    core_ctrl_request_completion,
    core_ctrl_review_completion,
} = require('../controllers/courseEnrollment.controller');

router.get('/', core_ctrl_get_enrollments);
router.post('/', core_ctrl_create_enrollment);
router.patch('/:id/progress', core_ctrl_update_progress);
router.patch('/:id/request-completion', core_ctrl_request_completion);
router.patch('/:id/review', core_ctrl_review_completion);

module.exports = router;
