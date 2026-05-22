
const { Router } = require('express');
const router = Router();
const taskTypes = require('../controllers/task_type.controllers');

router.get('/',       taskTypes.getAllTaskTypes);
router.get('/:id',    taskTypes.getTaskTypeById);
router.post('/',      taskTypes.createTaskType);
router.patch('/:id',  taskTypes.updateTaskType);
router.delete('/:id', taskTypes.deleteTaskType);

module.exports = router;
