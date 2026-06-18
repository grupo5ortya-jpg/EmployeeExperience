
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const tasks = require('../controllers/task.controllers');

router.get('/', tasks.getAllTasks);
router.get('/tasksTypeById', tasks.getAllTasksByType)
router.get('/:id', tasks.getTaskById);
router.post('/', authorize('Talento'), tasks.createTask);
router.patch('/:id', authorize('Talento'), tasks.updateTask);
router.delete('/:id', authorize('Talento'), tasks.deleteTask);


module.exports = router;
