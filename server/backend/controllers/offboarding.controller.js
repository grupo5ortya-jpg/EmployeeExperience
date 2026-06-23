const { Op, UniqueConstraintError } = require('sequelize');
const {
	sequelize,
	Employee, Person, User, Role,
	EmployeeOffboarding, AlumniProfile, EmployeeTask, Task,
	Survey, SurveyAssignment, QuestionType,
	Alert, EmployeeAsset, Asset,
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
// "Offboarding estándar"/Checklist) + estado de la entrevista de salida (Survey/SurveyAssignment
// del QuestionType "Offboarding"/"Salida").
async function formatOffboarding(offboarding, checklistTaskTypeId, exitInterviewQuestionTypeId) {
	// Despido: nunca se asigna checklist (ver startOffboarding) — se devuelve vacío directo en
	// vez de consultar por employee_id, que traería el checklist de una ronda de renuncia previa
	// sin limpiar (EmployeeTask no tiene offboarding_id, no hay forma de scopear por ronda).
	const isTermination = offboarding.exit_type === EMPLOYEE_OFFBOARDING.EXIT_TYPE_TERMINATION;

	const checklistTasks = isTermination
		? []
		: await EmployeeTask.findAll({
			where: { employee_id: offboarding.employee_id },
			include: [{
				model:      Task,
				as:         'task',
				attributes: ['id', 'name'],
				where:      { task_type_id: checklistTaskTypeId },
			}],
		});

	// Despido: tampoco se asigna entrevista de salida (ver startOffboarding) — mismo guard que
	// el checklist arriba. Sin esto, una ronda de despido posterior a una renuncia previa
	// mostraba la entrevista (incluso ya COMPLETED) de esa ronda vieja en vez de null.
	const exitInterview = isTermination
		? null
		: await SurveyAssignment.findOne({
			where: { employee_id: offboarding.employee_id },
			include: [{
				model:    Survey,
				as:       'survey',
				required: true,
				where:    { question_type_id: exitInterviewQuestionTypeId },
			}],
			order: [['createdAt', 'DESC']],
		});

	// Activos sin devolver — aplica tanto a renuncia como a despido (la notebook hay que
	// recuperarla en ambos casos), a diferencia del checklist/entrevista que sí se omiten en despido.
	const pendingAssets = await EmployeeAsset.findAll({
		where: { employee_id: offboarding.employee_id, return_date: null },
		include: [{ model: Asset, as: 'asset', attributes: ['id', 'name', 'serial_number'] }],
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
		assets: pendingAssets.map((ea) => ({
			id:             ea.asset_id,
			name:           ea.asset?.name ?? null,
			serialNumber:   ea.asset?.serial_number ?? null,
			assignmentDate: ea.assignment_date,
		})),
	};
}

const startOffboarding = async (req, res, next) => {
	try {
		const { employeeId, lastWorkingDay, rehirable, exitType, tags, assets } = req.body;
		if (!employeeId || !lastWorkingDay) {
			return res.status(400).json({ status: 'fail', message: 'employeeId y lastWorkingDay son requeridos' });
		}
		if (Number.isNaN(new Date(lastWorkingDay).getTime())) {
			return res.status(400).json({ status: 'fail', message: 'lastWorkingDay no es una fecha válida' });
		}
		if (Array.isArray(assets) && assets.some((item) =>
			(item?.name && item.name.trim().length > 150) ||
			(item?.serialNumber && item.serialNumber.trim().length > 150)
		)) {
			return res.status(400).json({ status: 'fail', message: 'Nombre/N° de serie de un activo no puede superar los 150 caracteres' });
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

		// Referencias de sistema (TaskType/QuestionType ya seedeados, findOrCreate idempotente) —
		// se resuelven fuera de la transacción a propósito: son datos de infraestructura
		// compartidos por todo el módulo, no algo específico de esta operación que deba revertirse
		// si el resto falla.
		const checklistTaskType = await getOffboardingChecklistTaskType();
		const exitInterviewQuestionType = await getExitInterviewQuestionType();

		// Despido: no hay checklist/entrevista que esperar, así que el caso se cierra solo en
		// el mismo momento — Talento no tiene que entrar después a tocar "Finalizar proceso".
		// Todo lo que sigue (creación del caso, activos, checklist, entrevista, alta de rol a
		// Alumni, vencimiento de tareas de otros templates) corre en una sola transacción — son
		// ~10 escrituras secuenciales y, sin esto, un fallo a mitad de camino (ej. un activo
		// duplicado) dejaba al empleado a medio migrar (caso creado pero rol sin cambiar, o
		// viceversa). Si cualquier paso falla, se hace rollback completo y no se cambia nada.
		const now = new Date();
		const t = await sequelize.transaction();

		try {
			// El `findOne` de arriba (línea ~136) cubre el caso feliz, pero corre fuera de esta
			// transacción — dos requests casi simultáneos (doble click, dos tabs) pueden pasarlo
			// ambos antes de que el primero confirme. El índice único parcial
			// `employee_offboardings_one_in_progress_per_employee` (ver models/EmployeeOffboarding.js,
			// solo sobre status=IN_PROGRESS — no afecta el histórico de boomerang employees) es la
			// defensa real bajo concurrencia: el segundo INSERT que llegue a la BD revienta acá con
			// un UniqueConstraintError limpio en vez de crear un proceso duplicado.
			let offboarding;
			try {
				offboarding = await EmployeeOffboarding.create({
					employee_id:      employeeId,
					initiated_by:     req.user?.employeeId ?? null,
					last_working_day: lastWorkingDay,
					rehirable:        rehirable !== undefined ? !!rehirable : true,
					exit_type:        resolvedExitType,
					status:           isTermination ? EMPLOYEE_OFFBOARDING.STATUS_COMPLETED : EMPLOYEE_OFFBOARDING.STATUS_IN_PROGRESS,
					completed_at:     isTermination ? now : null,
				}, { transaction: t });
			} catch (err) {
				if (err instanceof UniqueConstraintError) {
					await t.rollback();
					return res.status(409).json({ status: 'fail', message: 'Ya existe un proceso de offboarding en curso para este empleado' });
				}
				throw err;
			}

			// Activos a devolver registrados manualmente por HR al iniciar el proceso (ej. equipo
			// que nunca quedó cargado en el sistema). Cada item crea un Asset nuevo + su EmployeeAsset
			// — no se intenta matchear contra inventario existente (findOrCreate por name/serial_number
			// rompería el unique de EmployeeAsset.asset_id si ese asset ya tuvo otra asignación antes).
			// Aplica igual en despido — hay que recuperar el equipo en ambos casos.
			if (Array.isArray(assets)) {
				for (const item of assets) {
					const name = item?.name?.trim();
					if (!name) continue;

					// `Asset` tiene un índice único sobre (name, serial_number) — si dos registros
					// manuales coinciden exacto en ambos, devolver 400 claro en vez de un 500 crudo
					// de Postgres (caso borde documentado, EXP-DEV-07-FIX-03). Rollback explícito
					// porque salimos con un `return` directo, no con un `throw` hacia el catch de abajo.
					let asset;
					try {
						asset = await Asset.create({
							name,
							serial_number: item.serialNumber?.trim() || null,
						}, { transaction: t });
					} catch (err) {
						if (err instanceof UniqueConstraintError) {
							await t.rollback();
							return res.status(400).json({
								status:  'fail',
								message: `Ya existe un activo registrado con el nombre "${name}" y ese número de serie.`,
							});
						}
						throw err;
					}

					await EmployeeAsset.create({
						employee_id:     employeeId,
						asset_id:        asset.id,
						assignment_date: now,
					}, { transaction: t });
				}
			}

			// Checklist: una EmployeeTask por cada Task del TaskType "Offboarding estándar"/Checklist.
			// En despido no se asignan.
			const checklistTasks = await Task.findAll({ where: { task_type_id: checklistTaskType.id }, transaction: t });

			if (!isTermination && checklistTasks.length > 0) {
				const existingEmployeeTasks = await EmployeeTask.findAll({
					where: { employee_id: employeeId, task_id: { [Op.in]: checklistTasks.map((tsk) => tsk.id) } },
					transaction: t,
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
					await EmployeeTask.bulkCreate(newEmployeeTasks, { transaction: t });
				}

				// Empleado boomerang (renunció, lo recontrataron, renuncia de nuevo): la
				// EmployeeTask del checklist ya existe (misma PK employee_id+task_id) con el
				// estado del ciclo anterior (COMPLETED/DROPPED/lo que sea) — se resetea a
				// ENROLLED para este nuevo proceso, no debe arrastrar el checklist viejo.
				if (existingTaskIds.size > 0) {
					await EmployeeTask.update(
						{ status: EMPLOYEE_TASK.STATUS_ENROLLED, due_date: lastWorkingDay },
						{ where: { employee_id: employeeId, task_id: { [Op.in]: [...existingTaskIds] } }, transaction: t },
					);
				}
			}

			// Empleado boomerang (renunció, lo recontrataron, renuncia/despiden de nuevo dentro de
			// la ventana de 30 días): a diferencia del checklist (PK fija, se resetea), cada ronda
			// crea un Survey/SurveyAssignment nuevo — si la ronda anterior quedó PENDING sin
			// contestar, se cancela (soft delete, SurveyAssignment es paranoid) para que no se
			// acumule junto a la nueva en /exit-interviews/pending. Corre siempre, incluso si esta
			// ronda es despido (no debe quedar una entrevista vieja viva para alguien sin acceso).
			const staleAssignments = await SurveyAssignment.findAll({
				where: { employee_id: employeeId, status: SURVEY_ASSIGNMENT.STATUS_PENDING },
				include: [{ model: Survey, as: 'survey', required: true, where: { question_type_id: exitInterviewQuestionType.id } }],
				transaction: t,
			});
			if (staleAssignments.length > 0) {
				await SurveyAssignment.destroy({
					where: { employee_id: employeeId, survey_id: { [Op.in]: staleAssignments.map((a) => a.survey_id) } },
					transaction: t,
				});
			}

			// Entrevista de salida: Survey + SurveyAssignment respondible hasta last_working_day + 30
			// días. En despido no se genera — sin cuestionario para el empleado.
			if (!isTermination) {
				const dueDate = new Date(lastWorkingDay);
				dueDate.setDate(dueDate.getDate() + OFFBOARDING.EXIT_INTERVIEW_WINDOW_DAYS);

				const survey = await Survey.create({
					name:              'Entrevista de salida',
					question_type_id: exitInterviewQuestionType.id,
					start_date:        new Date(),
					end_date:          dueDate,
				}, { transaction: t });

				// assigned_by es parte de la PK compuesta (NOT NULL a nivel DB) — se usa el propio
				// employee_id para asignaciones generadas por el sistema, igual que el cron de Pulse.
				await SurveyAssignment.create({
					survey_id:   survey.id,
					employee_id: employeeId,
					assigned_by: employeeId,
					due_date:    dueDate,
					status:      SURVEY_ASSIGNMENT.STATUS_PENDING,
				}, { transaction: t });
			}

			// Transición a Alumni desde el inicio del proceso (no al finalizarlo): cambiar
			// User.role_id dispara el hook syncEmployeeStatus (Employee.status='INACTIVE',
			// limpia department_id/position). El empleado completa su checklist y entrevista
			// de salida ya como Alumni; "Finalizar proceso" queda como cierre formal de HR.
			const alumniRole = await Role.findOne({ where: { name: ROLE.ALUMNI }, transaction: t });
			const user = await User.findOne({ where: { employee_id: employeeId }, transaction: t });
			if (alumniRole && user) {
				await user.update({ role_id: alumniRole.id }, { transaction: t });
			}

			await AlumniProfile.findOrCreate({
				where:       { employee_id: employeeId },
				defaults:    { employee_id: employeeId, rehirable: offboarding.rehirable, tags: Array.isArray(tags) ? tags : [] },
				transaction: t,
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
						task_id:     { [Op.notIn]: checklistTasks.map((tsk) => tsk.id) },
					},
					transaction: t,
				},
			);

			await t.commit();

			// Fire-and-forget: fuera de la transacción a propósito, una alerta que no llegue a
			// crearse no debería revertir el offboarding ya confirmado.
			if (!isTermination) {
				Alert.create({
					employee_id: employeeId,
					type:        'OFFBOARDING_STARTED',
					message:     'Se inició tu proceso de desvinculación. Revisá tu checklist de salida y completá la entrevista de salida.',
					status:      'UNREAD',
				}).catch(console.error);
			}

			const full = await EmployeeOffboarding.findByPk(offboarding.id, { include: [EMPLOYEE_INCLUDE] });
			res.status(201).json(await formatOffboarding(full, checklistTaskType.id, exitInterviewQuestionType.id));
		} catch (err) {
			await t.rollback();
			throw err;
		}
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
