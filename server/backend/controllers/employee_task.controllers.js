const { EmployeeTask, Employee, Task, TaskType, Person, Alert } = require('../connection/sequelize');

const TASK_INCLUDE = {
	model:      Task,
	as:         'task',
	attributes: ['id', 'name', 'estimated_duration'],
	include:    [{ model: TaskType, as: 'taskType', attributes: ['id', 'name', 'sub_type'] }],
};

const EMPLOYEE_TASK_INCLUDE = [
	{
		model:      Employee,
		as:         'employee',
		attributes: ['id', 'position', 'status'],
		include:    [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
	},
	TASK_INCLUDE,
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
		task: et.task
			? {
				id:                et.task.id,
				name:              et.task.name,
				estimatedDuration: et.task.estimated_duration ?? null,
				taskType:          et.task.taskType ?? null,
			}
			: null,
	};
}

// Fire-and-forget: alert HR when employee completes all tasks
async function checkOnboardingCompletion(employeeId) {
	const allTasks = await EmployeeTask.findAll({ where: { employee_id: employeeId } });
	if (!allTasks.length || !allTasks.every((t) => t.status === 'COMPLETED')) return;

	const existing = await Alert.findOne({
		where: { employee_id: employeeId, type: 'ONBOARDING_COMPLETED' },
	});
	if (existing) return;

	const emp = await Employee.findByPk(employeeId, {
		include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
	});
	const name = emp
		? `${emp.person?.first_name ?? ''} ${emp.person?.last_name ?? ''}`.trim()
		: 'El empleado';

	await Alert.create({
		employee_id: employeeId,
		type:        'ONBOARDING_COMPLETED',
		message:     `${name} completó todas las tareas de onboarding asignadas.`,
		status:      'UNREAD',
	});
}

const getAllEmployeeTasks = async (req, res, next) => {
	try {
		const where = {};
		if (req.query.taskId)     where.task_id     = req.query.taskId;
		if (req.query.employeeId) where.employee_id = req.query.employeeId;
		const records = await EmployeeTask.findAll({ where, include: EMPLOYEE_TASK_INCLUDE, subQuery: false });
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
			status:      status || 'ENROLLED',
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

		if (status === 'SUBMITTED') {
			// Alert HR that employee submitted a task for review
			const emp      = updated.employee;
			const taskName = updated.task?.name ?? 'una tarea';
			const name     = emp
				? `${emp.person?.first_name ?? ''} ${emp.person?.last_name ?? ''}`.trim()
				: 'Un empleado';

			Alert.create({
				employee_id: employeeId,
				type:        'ONBOARDING_TASK_SUBMITTED',
				message:     `${name} marcó "${taskName}" como completada. Pendiente de aprobación.`,
				status:      'UNREAD',
			}).catch(console.error);
		}

		// Check if all tasks completed → alert HR
		if (status === 'COMPLETED') {
			checkOnboardingCompletion(employeeId).catch(console.error);
		}

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
