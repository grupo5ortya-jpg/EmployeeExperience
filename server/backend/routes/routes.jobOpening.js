const express = require('express');
const router = express.Router();

const {
    core_ctrl_get_job_openings,
    core_ctrl_get_job_opening_by_id,
    core_ctrl_create_job_opening,
    core_ctrl_update_job_opening,
    core_ctrl_delete_job_opening
} = require('../controllers/jobOpening.controller');

router.get('/', core_ctrl_get_job_openings);
router.get('/:id', core_ctrl_get_job_opening_by_id);
router.post('/', core_ctrl_create_job_opening);
router.put('/:id', core_ctrl_update_job_opening);
router.patch('/:id', core_ctrl_update_job_opening);
router.delete('/:id', core_ctrl_delete_job_opening);

module.exports = router;