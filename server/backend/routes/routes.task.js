
const { Router } = require('express');
const router = Router();
const tasks = require('../controllers/task.controllers');

router.get('/',       tasks.getAllTasks);
router.get('/:id',    tasks.getTaskById);
router.post('/',      tasks.createTask);
router.patch('/:id',  tasks.updateTask);
router.delete('/:id', tasks.deleteTask);

module.exports = router;
