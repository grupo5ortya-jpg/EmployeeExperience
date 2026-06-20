const { Op } = require('sequelize');
const {
	Employee, Person, User, Role,
	EmployeeOffboarding, AlumniProfile, EmployeeTask, Task,
	Survey, SurveyAssignment, QuestionType,
	Alert,
} = require('../connection/sequelize');
const { EMPLOYEE, EMPLOYEE_TASK, EMPLOYEE_OFFBOARDING, OFFBOARDING, SURVEY_ASSIGNMENT, ROLE } = require('../utils/constants/models.constants.js');
const { getOffboardingChecklistTaskType, getExitInterviewQuestionType } = require('../utils/offboarding.js');

const EMPLOYEE_INCLUDE = {
	model:      Employee,
	as:         'employee',
	attributes: ['id', 'status'],
	include:    [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
};

// Arma la respuesta para el frontend: checklist (progreso sobre Task/EmployeeTask del TaskType
// "Offboarding estándad"/Checklist) + estado de la entrevista de salida (Survey/SurveyAssignment
// del QuestionType "Offboarding"/"Salida").
async function formatOffboarding(offboarding, checklistTaskTypeId, exitInterviewQuestionTypeId) {
	const checklistTasks = await EmployeeTask.findAll({
		where: { employee_id: offboarding.employee_id },
		include: [{
			model:      Task,
			as:         'task',
			attributes: ['id', 'name'],
			where:      { task_type_id: checklistTaskTypeId },
		}],
	});

	const exitInterview = await SurveyAssignment.findOne({
		where: { employee_id: offboarding.employee_id },
		include: [{
			model:    Survey,
			as:       'survey',
			required: true,
			where:    { question_type_id: exitInterviewQuestionTypeId },
		}],
		order: [['createdAt', 'DESC']],
	});

	return {
		id:             offboarding.id,
		employeeId:     offboarding.employee_id,
		initiatedBy:    offboarding.initiated_by,
		lastWorkingDay: offboarding.last_working_day,
		rehirable:      offboarding.rehirable,
		exitType:       offboarding.exit_type,
		status:         offboarding.status,
		startedAt:      offboarding.started_at,
		completedAt:    offboarding.completed_at ?? null,
		employee: offboarding.employee
			? {
				id:        offboarding.employee.id,
				status:    offboarding.employee.status,
				firstName: offboarding.employee.person?.first_name ?? null,
				lastName:  offboarding.employee.person?.last_name  ?? null,
			}
			: null,
		checklist: {
			total:     checklistTasks.length,
			completed: checklistTasks.filter((et) => et.status === EMPLOYEE_TASK.STATUS_COMPLETED).length,
			tasks: checklistTasks.map((et) => ({
				taskId:  et.task_id,
				name:    et.task?.name ?? null,
				status:  et.status,
				dueDate: et.due_date,
			})),
		},
		exitInterview: exitInterview
			? {
				surveyId: exitInterview.survey_id,
				status:   exitInterview.status,
				dueDate:  exitInterview.due_date,
			}
			: null,
	};
}

const startOffboarding = async (req, res, next) => {
	try {
		const { employeeId, lastWorkingDay, rehirable, exitType, tags } = req.body;
		if (!employeeId || !lastWorkingDay) {
			return res.status(400).json({ status: 'fail', message: 'employeeId y lastWorkingDay son requeridos' });
		}

		// Despido (TERMINATION): sin checklist, sin entrevista de salida, sin alert al empleado —
		// el proceso se registra igual para tracking de HR, pero no se le envía nada al empleado.
		const isTermination = exitType === EMPLOYEE_OFFBOARDING.EXIT_TYPE_TERMINATION;
		const resolvedExitType = isTermination
			? EMPLOYEE_OFFBOARDING.EXIT_TYPE_TERMINATION
			: EMPLOYEE_OFFBOARDING.EXIT_TYPE_RESIGNATION;

		const employee = await Employee.findByPk(employeeId);
		if (!employee) return res.status(404).json({ status: 'fail', message: 'Employee not found' });
		if (employee.status !== EMPLOYEE.STATUS_ACTIVE) {
			return res.status(400).json({ status: 'fail', message: 'El empleado no está activo' });
		}

		const existing = await EmployeeOffboarding.findOne({
			where: { employee_id: employeeId, status: EMPLOYEE_OFFBOARDING.STATUS_IN_PROGRESS },
		});
		if (existing) {
			return res.status(409).json({ status: 'fail', message: 'Ya existe un proceso de offboarding en curso para este empleado' });
		}

		// Despido: no hay checklist/entrevista que esperar, así que el caso se cierra solo en
		// el mismo momento — Talento no tiene que entrar después a tocar "Finalizar proceso".
		const now = new Date();
		const offboarding = await EmployeeOffboarding.create({
			employee_id:      employeeId,
			initiated_by:     req.user?.employeeId ?? null,
			last_working_day: lastWorkingDay,
			rehirable:        rehirable !== undefined ? !!rehirable : true,
			exit_type:        resolvedExitType,
			status:           isTermination ? EMPLOYEE_OFFBOARDING.STATUS_COMPLETED : EMPLOYEE_OFFBOARDING.STATUS_IN_PROGRESS,
			completed_at:     isTermination ? now : null,
		});

		// Checklist: una EmployeeTask por cada Task del TaskType "Offboarding estándad"/Checklist.
		// En despido no se asignan — el TaskType se sigue resolviendo (findOrCreate) porque
		// formatOffboarding lo necesita para reportar checklist:{total:0} de forma consistente.
		const checklistTaskType = await getOffboardingChecklistTaskType();
		const checklistTasks = await Task.findAll({ where: { task_type_id: checklistTaskType.id } });

		if (!isTermination && checklistTasks.length > 0) {
			const existingEmployeeTasks = await EmployeeTask.findAll({
				where: { employee_id: employeeId, task_id: { [Op.in]: checklistTasks.map((t) => t.id) } },
			});
			const existingTaskIds = new Set(existingEmployeeTasks.map((et) => et.task_id));

			const newEmployeeTasks = checklistTasks
				.filter((task) => !existingTaskIds.has(task.id))
				.map((task) => ({
					employee_id: employeeId,
					task_id:     task.id,
					status:      EMPLOYEE_TASK.STATUS_ENROLLED,
					due_date:    lastWorkingDay,
				}));

			if (newEmployeeTasks.length > 0) {
				await EmployeeTask.bulkCreate(newEmployeeTasks);
			}

			// Empleado boomerang (renunció, lo recontrataron, renuncia de nuevo): la
			// EmployeeTask del checklist ya existe (misma PK employee_id+task_id) con el
			// estado del ciclo anterior (COMPLETED/DROPPED/lo que sea) — se resetea a
			// ENROLLED para este nuevo proceso, no debe arrastrar el checklist viejo.
			if (existingTaskIds.size > 0) {
				await EmployeeTask.update(
					{ status: EMPLOYEE_TASK.STATUS_ENROLLED, due_date: lastWorkingDay },
					{ where: { employee_id: employeeId, task_id: { [Op.in]: [...existingTaskIds] } } },
				);
			}
		}

		// Entrevista de salida: Survey + SurveyAssignment respondible hasta last_working_day + 30 días.
		// En despido no se genera — sin cuestionario para el empleado.
		const exitInterviewQuestionType = await getExitInterviewQuestionType();

		// Empleado boomerang (renunció, lo recontrataron, renuncia/despiden de nuevo dentro de
		// la ventana de 30 días): a diferencia del checklist (PK fija, se resetea), cada ronda
		// crea un Survey/SurveyAssignment nuevo — si la ronda anterior quedó PENDING sin
		// contestar, se cancela (soft delete, SurveyAssignment es paranoid) para que no se
		// acumule junto a la nueva en /exit-interviews/pending. Corre siempre, incluso si esta
		// ronda es despido (no debe quedar una entrevista vieja viva para alguien sin acceso).
		const staleAssignments = await SurveyAssignment.findAll({
			where: { employee_id: employeeId, status: SURVEY_ASSIGNMENT.STATUS_PENDING },
			include: [{ model: Survey, as: 'survey', required: true, where: { question_type_id: exitInterviewQuestionType.id } }],
		});
		if (staleAssignments.length > 0) {
			await SurveyAssignment.destroy({
				where: { employee_id: employeeId, survey_id: { [Op.in]: staleAssignments.map((a) => a.survey_id) } },
			});
		}

		if (!isTermination) {
			const dueDate = new Date(lastWorkingDay);
			dueDate.setDate(dueDate.getDate() + OFFBOARDING.EXIT_INTERVIEW_WINDOW_DAYS);

			const survey = await Survey.create({
				name:              'Entrevista de salida',
				question_type_id: exitInterviewQuestionType.id,
				start_date:        new Date(),
				end_date:          dueDate,
			});

			// assigned_by es parte de la PK compuesta (NOT NULL a nivel DB) — se usa el propio
			// employee_id para asignaciones generadas por el sistema, igual que el cron de Pulse.
			await SurveyAssignment.create({
				survey_id:   survey.id,
				employee_id: employeeId,
				assigned_by: employeeId,
				due_date:    dueDate,
				status:      SURVEY_ASSIGNMENT.STATUS_PENDING,
			});

			Alert.create({
				employee_id: employeeId,
				type:        'OFFBOARDING_STARTED',
				message:     'Se inició tu proceso de desvinculación. Revisá tu checklist de salida y completá la entrevista de salida.',
				status:      'UNREAD',
			}).catch(console.error);
		}

		// Transición a Alumni desde el inicio del proceso (no al finalizarlo): cambiar
		// User.role_id dispara el hook syncEmployeeStatus (Employee.status='INACTIVE',
		// limpia department_id/position). El empleado completa su checklist y entrevista
		// de salida ya como Alumni; "Finalizar proceso" queda como cierre formal de HR.
		const alumniRole = await Role.findOne({ where: { name: ROLE.ALUMNI } });
		const user = await User.findOne({ where: { employee_id: employeeId } });
		if (alumniRole && user) {
			await user.update({ role_id: alumniRole.id });
		}

		await AlumniProfile.findOrCreate({
			where:    { employee_id: employeeId },
			defaults: { employee_id: employeeId, rehirable: offboarding.rehirable, tags: Array.isArray(tags) ? tags : [] },
		});

		// Tareas pendientes de OTROS templates (ej. onboarding) dejan de tener sentido una vez
		// que el empleado es Alumni — se marcan vencidas (due_date al pasado) en vez de quedar
		// accionables para siempre en MyTasks/AllAssignmentsPage. No se tocan SUBMITTED/
		// COMPLETED/DROPPED/REJECTED (ya resueltas).
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		await EmployeeTask.update(
			{ due_date: yesterday },
			{
				where: {
					employee_id: employeeId,
					status:      { [Op.in]: [EMPLOYEE_TASK.STATUS_ENROLLED, EMPLOYEE_TASK.STATUS_IN_PROGRESS] },
					task_id:     { [Op.notIn]: checklistTasks.map((t) => t.id) },
				},
			},
		);

		const full = await EmployeeOffboarding.findByPk(offboarding.id, { include: [EMPLOYEE_INCLUDE] });
		res.status(201).json(await formatOffboarding(full, checklistTaskType.id, exitInterviewQuestionType.id));
	} catch (err) {
		next(err);
	}
};

const getAllOffboardings = async (req, res, next) => {
	try {
		const where = {};
		if (req.query.status) where.status = req.query.status;

		const offboardings = await EmployeeOffboarding.findAll({
			where,
			include: [EMPLOYEE_INCLUDE],
			order:   [['started_at', 'DESC']],
		});

		const checklistTaskType = await getOffboardingChecklistTaskType();
		const exitInterviewQuestionType = await getExitInterviewQuestionType();

		res.json(await Promise.all(
			offboardings.map((o) => formatOffboarding(o, checklistTaskType.id, exitInterviewQuestionType.id))
		));
	} catch (err) {
		next(err);
	}
};

const getOffboardingByEmployee = async (req, res, next) => {
	try {
		const offboarding = await EmployeeOffboarding.findOne({
			where:   { employee_id: req.params.employeeId },
			include: [EMPLOYEE_INCLUDE],
			order:   [['started_at', 'DESC']],
		});
		if (!offboarding) return res.status(404).json({ status: 'fail', message: 'No se encontró un proceso de offboarding para este empleado' });

		const checklistTaskType = await getOffboardingChecklistTaskType();
		const exitInterviewQuestionType = await getExitInterviewQuestionType();

		res.json(await formatOffboarding(offboarding, checklistTaskType.id, exitInterviewQuestionType.id));
	} catch (err) {
		next(err);
	}
};

const completeOffboarding = async (req, res, next) => {
	try {
		const { employeeId } = req.params;

		const offboarding = await EmployeeOffboarding.findOne({
			where: { employee_id: employeeId, status: EMPLOYEE_OFFBOARDING.STATUS_IN_PROGRESS },
		});
		if (!offboarding) {
			return res.status(404).json({ status: 'fail', message: 'No hay un proceso de offboarding en curso para este empleado' });
		}

		// La transición a Alumni ya ocurrió al iniciar el proceso (ver startOffboarding).
		// Esto es solo el cierre formal del caso por parte de HR.
		await offboarding.update({
			status:       EMPLOYEE_OFFBOARDING.STATUS_COMPLETED,
			completed_at: new Date(),
		});

		const checklistTaskType = await getOffboardingChecklistTaskType();
		const exitInterviewQuestionType = await getExitInterviewQuestionType();
		const full = await EmployeeOffboarding.findByPk(offboarding.id, { include: [EMPLOYEE_INCLUDE] });
		res.json(await formatOffboarding(full, checklistTaskType.id, exitInterviewQuestionType.id));
	} catch (err) {
		next(err);
	}
};

module.exports = { startOffboarding, getAllOffboardings, getOffboardingByEmployee, completeOffboarding };
