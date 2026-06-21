const { TaskType, Task } = require('../connection/sequelize');
const { TASK_TYPE } = require('../utils/constants/models.constants.js');

function isSystemTaskType(taskType) {
	return TASK_TYPE.SYSTEM_TASK_TYPES.some(
		(s) => s.name === taskType.name && s.sub_type === taskType.sub_type,
	);
}

function formatTaskType(t, taskCount = 0) {
	return {
		id: t.id,
		name: t.name,
		subType: t.sub_type ?? null,
		isProtected: t.is_protected,
		isSystem: isSystemTaskType(t),
		taskCount,
	};
}

const getAllTaskTypes = async (req, res, next) => {
	try {
		const taskTypes = await TaskType.findAll();
		const tasks = await Task.findAll({ attributes: ['task_type_id'] });
		const countByType = tasks.reduce((acc, t) => {
			acc[t.task_type_id] = (acc[t.task_type_id] ?? 0) + 1;
			return acc;
		}, {});
		res.json(taskTypes.map((tt) => formatTaskType(tt, countByType[tt.id] ?? 0)));
	} catch (err) {
		next(err);
	}
};

const getTaskTypeById = async (req, res, next) => {
	try {
		const taskType = await TaskType.findByPk(req.params.id);
		if (!taskType) return res.status(404).json({ status: 'fail', message: 'Task type not found' });
		res.json(formatTaskType(taskType));
	} catch (err) {
		next(err);
	}
};

const createTaskType = async (req, res, next) => {
	try {
		const { name, subType } = req.body;
		const taskType = await TaskType.create({ name, sub_type: subType || null });
		res.status(201).json(formatTaskType(taskType));
	} catch (err) {
		next(err);
	}
};

const updateTaskType = async (req, res, next) => {
	try {
		const taskType = await TaskType.findByPk(req.params.id);
		if (!taskType) return res.status(404).json({ status: 'fail', message: 'Task type not found' });

		const { name, subType, isProtected } = req.body;
		const updates = {};
		if (name !== undefined) updates.name = name;
		if (subType !== undefined) updates.sub_type = subType || null;
		// Las TaskTypes del sistema quedan siempre protegidas, no se pueden desproteger
		if (isProtected !== undefined && !isSystemTaskType(taskType)) updates.is_protected = !!isProtected;

		await taskType.update(updates);
		res.json(formatTaskType(taskType));
	} catch (err) {
		next(err);
	}
};

const deleteTaskType = async (req, res, next) => {
	try {
		const taskType = await TaskType.findByPk(req.params.id);
		if (!taskType) return res.status(404).json({ status: 'fail', message: 'Task type not found' });

		if (taskType.is_protected) {
			return res.status(400).json({ status: 'fail', message: 'Este template está protegido y no puede eliminarse.' });
		}

		// Soft-delete all tasks so EmployeeTask history is preserved via paranoid FK
		await Task.destroy({ where: { task_type_id: req.params.id } });

		await taskType.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllTaskTypes,
	getTaskTypeById,
	createTaskType,
	updateTaskType,
	deleteTaskType,
};
