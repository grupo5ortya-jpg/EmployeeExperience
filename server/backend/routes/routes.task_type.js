
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const taskTypes = require('../controllers/task_type.controllers');

router.get('/',       taskTypes.getAllTaskTypes);
router.get('/:id',    taskTypes.getTaskTypeById);
router.post('/',      authorize('Talento'), taskTypes.createTaskType);
router.patch('/:id',  authorize('Talento'), taskTypes.updateTaskType);
router.delete('/:id', authorize('Talento'), taskTypes.deleteTaskType);

module.exports = router;
