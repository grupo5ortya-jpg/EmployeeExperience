const { Op } = require('sequelize');
const { EmployeeTask, Employee, Task, TaskType, Person, Alert } = require('../connection/sequelize');

const TASK_INCLUDE = {
	model:      Task,
	as:         'task',
	paranoid:   false,   // include soft-deleted tasks to preserve employee history
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

// Fire-and-forget: alert HR once all tasks of a template are SUBMITTED (or done)
async function checkTemplateCompletion(employeeId, taskId) {
	const task = await Task.findByPk(taskId, { attributes: ['id', 'task_type_id'] });
	if (!task?.task_type_id) return;
	const taskTypeId = task.task_type_id;

	const templateTasks = await Task.findAll({
		where:      { task_type_id: taskTypeId },
		attributes: ['id'],
	});
	const templateTaskIds = templateTasks.map((t) => t.id);

	const employeeTasks = await EmployeeTask.findAll({
		where: { employee_id: employeeId, task_id: templateTaskIds },
	});

	if (employeeTasks.length !== templateTaskIds.length) return;
	const done = ['SUBMITTED', 'COMPLETED'];
	if (!employeeTasks.every((t) => done.includes(t.status))) return;

	const existing = await Alert.findOne({
		where: {
			employee_id: employeeId,
			type:        'ONBOARDING_TEMPLATE_SUBMITTED',
			topics:      { [Op.contains]: { taskTypeId } },
		},
	});
	if (existing) return;

	const emp = await Employee.findByPk(employeeId, {
		include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
	});
	const name = emp
		? `${emp.person?.first_name ?? ''} ${emp.person?.last_name ?? ''}`.trim()
		: 'Un empleado';

	const taskType = await TaskType.findByPk(taskTypeId, { attributes: ['name'] });
	const templateName = taskType?.name ?? 'un template';

	await Alert.create({
		employee_id: employeeId,
		type:        'ONBOARDING_TEMPLATE_SUBMITTED',
		message:     `${name} completó todas las tareas del template "${templateName}". Pendiente de aprobación.`,
		status:      'UNREAD',
		topics:      { taskTypeId },
	});
}

// Fire-and-forget: alert employee when HR marks all tasks of a template as COMPLETED
async function checkTemplateApproved(employeeId, taskId) {
	const task = await Task.findByPk(taskId, { attributes: ['id', 'task_type_id'] });
	if (!task?.task_type_id) return;
	const taskTypeId = task.task_type_id;

	const templateTasks = await Task.findAll({
		where:      { task_type_id: taskTypeId },
		attributes: ['id'],
	});
	const templateTaskIds = templateTasks.map((t) => t.id);

	const employeeTasks = await EmployeeTask.findAll({
		where: { employee_id: employeeId, task_id: templateTaskIds },
	});

	if (employeeTasks.length !== templateTaskIds.length) return;
	if (!employeeTasks.every((t) => t.status === 'COMPLETED')) return;

	const existing = await Alert.findOne({
		where: {
			employee_id: employeeId,
			type:        'ONBOARDING_TEMPLATE_APPROVED',
			topics:      { [Op.contains]: { taskTypeId } },
		},
	});
	if (existing) return;

	const taskType = await TaskType.findByPk(taskTypeId, { attributes: ['name'] });
	const templateName = taskType?.name ?? 'tu template';

	await Alert.create({
		employee_id: employeeId,
		type:        'ONBOARDING_TEMPLATE_APPROVED',
		message:     `¡Tus tareas del template "${templateName}" fueron aprobadas por RRHH! 🎉`,
		status:      'UNREAD',
		topics:      { taskTypeId },
	});
}

// Fire-and-forget: alert HR when employee completes ALL assigned tasks across all templates
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

		// Find all tasks in the same template
		const primaryTask = await Task.findByPk(taskId, { attributes: ['id', 'task_type_id', 'estimated_duration'] });
		if (!primaryTask) return res.status(404).json({ status: 'fail', message: 'Task not found' });

		const templateTasks = await Task.findAll({
			where:      { task_type_id: primaryTask.task_type_id },
			attributes: ['id', 'estimated_duration'],
		});

		// Skip tasks already assigned to this employee
		const existing = await EmployeeTask.findAll({
			where: { employee_id: employeeId, task_id: templateTasks.map((t) => t.id) },
			attributes: ['task_id'],
		});
		const existingIds = new Set(existing.map((e) => e.task_id));

		const baseDate = dueDate ? new Date(dueDate) : new Date();
		const toCreate = templateTasks
			.filter((t) => !existingIds.has(t.id))
			.map((t) => {
				const d = new Date(baseDate);
				d.setDate(d.getDate() + (t.estimated_duration ?? 0));
				return { employee_id: employeeId, task_id: t.id, status: status || 'ENROLLED', due_date: d };
			});

		if (toCreate.length > 0) {
			await EmployeeTask.bulkCreate(toCreate, { ignoreDuplicates: true });
		}

		// Alert the employee only if new tasks were created
		if (toCreate.length > 0) {
			Alert.create({
				employee_id: employeeId,
				type:        'ONBOARDING_TASKS_ASSIGNED',
				message:     `Se te asignaron ${toCreate.length} tarea${toCreate.length !== 1 ? 's' : ''} de onboarding. ¡Comenzá tu incorporación!`,
				status:      'UNREAD',
			}).catch(console.error);
		}

		const full = await EmployeeTask.findOne({
			where:   { employee_id: employeeId, task_id: taskId },
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
			checkTemplateCompletion(employeeId, taskId).catch(console.error);
		}

		if (status === 'COMPLETED') {
			checkTemplateApproved(employeeId, taskId).catch(console.error);
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
