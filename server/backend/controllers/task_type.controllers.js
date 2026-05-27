const { TaskType } = require('../connection/sequelize');

function formatTaskType(t) {
	return {
		id: t.id,
		name: t.name,
		subType: t.sub_type ?? null,
	};
}

const getAllTaskTypes = async (req, res, next) => {
	try {
		const taskTypes = await TaskType.findAll();
		console.log(taskTypes.map(formatTaskType))
		res.json(taskTypes.map(formatTaskType));
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

		const { name, subType } = req.body;
		const updates = {};
		if (name !== undefined) updates.name = name;
		if (subType !== undefined) updates.sub_type = subType || null;

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
