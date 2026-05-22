const { EmployeeTask, Employee, Task, Person } = require('../connection/sequelize');

const EMPLOYEE_TASK_INCLUDE = [
	{
		model:      Employee,
		as:         'employee',
		attributes: ['id', 'position', 'status'],
		include:    [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
	},
	{ model: Task, as: 'task', attributes: ['id', 'name', 'estimated_duration'] },
];

function formatEmployeeTask(et) {
	return {
		employeeId: et.employee_id,
		taskId:     et.task_id,
		status:     et.status,
		dueDate:    et.due_date,
		createdAt:  et.createdAt,
		updatedAt:  et.updatedAt,
		employee:   et.employee
			? {
				id:        et.employee.id,
				position:  et.employee.position,
				status:    et.employee.status,
				firstName: et.employee.person?.first_name ?? null,
				lastName:  et.employee.person?.last_name  ?? null,
			}
			: null,
		task: et.task ?? null,
	};
}

const getAllEmployeeTasks = async (req, res, next) => {
	try {
		const records = await EmployeeTask.findAll({ include: EMPLOYEE_TASK_INCLUDE });
		res.json(records.map(formatEmployeeTask));
	} catch (err) {
		next(err);
	}
};

const getEmployeeTaskById = async (req, res, next) => {
	try {
		const { employeeId, taskId } = req.params;
		const record = await EmployeeTask.findOne({
			where:   { employee_id: employeeId, task_id: taskId },
			include: EMPLOYEE_TASK_INCLUDE,
		});
		if (!record) return res.status(404).json({ status: 'fail', message: 'Employee task not found' });
		res.json(formatEmployeeTask(record));
	} catch (err) {
		next(err);
	}
};

const createEmployeeTask = async (req, res, next) => {
	try {
		const { employeeId, taskId, status, dueDate } = req.body;
		const record = await EmployeeTask.create({
			employee_id: employeeId,
			task_id:     taskId,
			status:      status   || 'ENROLLED',
			due_date:    dueDate,
		});
		const full = await EmployeeTask.findOne({
			where:   { employee_id: record.employee_id, task_id: record.task_id },
			include: EMPLOYEE_TASK_INCLUDE,
		});
		res.status(201).json(formatEmployeeTask(full));
	} catch (err) {
		next(err);
	}
};

const updateEmployeeTask = async (req, res, next) => {
	try {
		const { employeeId, taskId } = req.params;
		const record = await EmployeeTask.findOne({
			where: { employee_id: employeeId, task_id: taskId },
		});
		if (!record) return res.status(404).json({ status: 'fail', message: 'Employee task not found' });

		const { status, dueDate } = req.body;
		const updates = {};
		if (status  !== undefined) updates.status   = status;
		if (dueDate !== undefined) updates.due_date = dueDate;

		await record.update(updates);
		const updated = await EmployeeTask.findOne({
			where:   { employee_id: employeeId, task_id: taskId },
			include: EMPLOYEE_TASK_INCLUDE,
		});
		res.json(formatEmployeeTask(updated));
	} catch (err) {
		next(err);
	}
};

const deleteEmployeeTask = async (req, res, next) => {
	try {
		const { employeeId, taskId } = req.params;
		const record = await EmployeeTask.findOne({
			where: { employee_id: employeeId, task_id: taskId },
		});
		if (!record) return res.status(404).json({ status: 'fail', message: 'Employee task not found' });
		await record.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllEmployeeTasks,
	getEmployeeTaskById,
	createEmployeeTask,
	updateEmployeeTask,
	deleteEmployeeTask,
};
