const { Task, TaskType } = require('../connection/sequelize');

const TASK_INCLUDE = [
	{ model: TaskType, as: 'taskType', attributes: ['id', 'name', 'sub_type'] },
];

function formatTask(t) {
	return {
		id:                t.id,
		name:              t.name,
		estimatedDuration: t.estimated_duration ?? null,
		taskType:          t.taskType ?? null,
	};
}

const getAllTasks = async (req, res, next) => {
	try {
		const tasks = await Task.findAll({ include: TASK_INCLUDE });
		res.json(tasks.map(formatTask));
	} catch (err) {
		next(err);
	}
};

const getTaskById = async (req, res, next) => {
	try {
		const task = await Task.findByPk(req.params.id, { include: TASK_INCLUDE });
		if (!task) return res.status(404).json({ status: 'fail', message: 'Task not found' });
		res.json(formatTask(task));
	} catch (err) {
		next(err);
	}
};

const createTask = async (req, res, next) => {
	try {
		const { name, taskTypeId, estimatedDuration } = req.body;
		const task = await Task.create({
			name,
			task_type_id:       taskTypeId,
			estimated_duration: estimatedDuration ?? null,
		});
		const full = await Task.findByPk(task.id, { include: TASK_INCLUDE });
		res.status(201).json(formatTask(full));
	} catch (err) {
		next(err);
	}
};

const updateTask = async (req, res, next) => {
	try {
		const task = await Task.findByPk(req.params.id);
		if (!task) return res.status(404).json({ status: 'fail', message: 'Task not found' });

		const { name, taskTypeId, estimatedDuration } = req.body;
		const updates = {};
		if (name              !== undefined) updates.name               = name;
		if (taskTypeId        !== undefined) updates.task_type_id       = taskTypeId;
		if (estimatedDuration !== undefined) updates.estimated_duration = estimatedDuration ?? null;

		await task.update(updates);
		const updated = await Task.findByPk(task.id, { include: TASK_INCLUDE });
		res.json(formatTask(updated));
	} catch (err) {
		next(err);
	}
};

// paranoid: true → sets deletedAt instead of hard-deleting
const deleteTask = async (req, res, next) => {
	try {
		const task = await Task.findByPk(req.params.id);
		if (!task) return res.status(404).json({ status: 'fail', message: 'Task not found' });
		await task.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllTasks,
	getTaskById,
	createTask,
	updateTask,
	deleteTask,
};
