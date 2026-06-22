const { Op } = require('sequelize');
const { EmployeeTask, Task, TaskType, Skill, Employee, Person, EmployeeSkill, Alert } = require('../connection/sequelize');
const { EMPLOYEE_TASK, COURSE_ENROLLMENT, TASK_TYPE } = require('../utils/constants/models.constants.js');
const { getCourseTaskType } = require('../utils/learning.js');

// EmployeeTask.status (onboarding) <-> CourseEnrollment.status (Learning) que ve el frontend
const STATUS_TO_API = {
	[EMPLOYEE_TASK.STATUS_ENROLLED]:    COURSE_ENROLLMENT.STATUS_IN_PROGRESS,
	[EMPLOYEE_TASK.STATUS_IN_PROGRESS]: COURSE_ENROLLMENT.STATUS_IN_PROGRESS,
	[EMPLOYEE_TASK.STATUS_SUBMITTED]:   COURSE_ENROLLMENT.STATUS_PENDING_APPROVAL,
	[EMPLOYEE_TASK.STATUS_COMPLETED]:   COURSE_ENROLLMENT.STATUS_COMPLETED,
	[EMPLOYEE_TASK.STATUS_DROPPED]:     COURSE_ENROLLMENT.STATUS_IN_PROGRESS,
	[EMPLOYEE_TASK.STATUS_REJECTED]:    COURSE_ENROLLMENT.STATUS_REJECTED,
};

const COURSE_INCLUDE = {
	model:    Task,
	as:       'task',
	paranoid: false, // preservar historial si el curso fue eliminado
	include: [
		{ model: TaskType, as: 'taskType', attributes: ['id', 'name', 'sub_type'] },
		{ model: Skill, as: 'skill', attributes: ['id', 'name'] },
	],
};

const EMPLOYEE_INCLUDE = {
	model: Employee,
	as:    'employee',
	attributes: ['id'],
	include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
};

function formatEnrollment(et) {
	return {
		id:              `${et.employee_id}_${et.task_id}`,
		employeeId:      et.employee_id,
		courseId:        et.task_id,
		status:          STATUS_TO_API[et.status] ?? COURSE_ENROLLMENT.STATUS_IN_PROGRESS,
		progress:        et.progress ?? 0,
		certificateLink: et.certificate_link ?? null,
		course: et.task
			? {
				id:          et.task.id,
				title:       et.task.name,
				description: et.task.description ?? null,
				duration:    et.task.duration ?? null,
				modality:    et.task.modality ?? null,
				link:        et.task.link ?? null,
				skill:       et.task.skill ?? null,
				isExternal:  et.task.is_external ?? false,
				institution: et.task.institution ?? null,
			}
			: null,
		employee: et.employee
			? {
				id:        et.employee.id,
				firstName: et.employee.person?.first_name ?? null,
				lastName:  et.employee.person?.last_name  ?? null,
			}
			: null,
	};
}

// id expuesto al frontend = "employeeId_taskId" (EmployeeTask tiene PK compuesta, sin id propio)
function parseEnrollmentId(id) {
	const [employeeId, taskId] = id.split('_');
	return { employeeId, taskId };
}

const getAllEnrollments = async (req, res, next) => {
	try {
		const where = {
			'$task.taskType.sub_type$': TASK_TYPE.TASK_TYPE_SUB_TYPE_COURSE,
		};
		if (req.query.employeeId) where.employee_id = req.query.employeeId;
		if (req.query.courseId)   where.task_id     = req.query.courseId;
		if (req.query.status) {
			const dbStatuses = Object.entries(STATUS_TO_API)
				.filter(([, apiStatus]) => apiStatus === req.query.status)
				.map(([dbStatus]) => dbStatus);
			where.status = { [Op.in]: dbStatuses };
		}

		const enrollments = await EmployeeTask.findAll({
			where,
			include: [COURSE_INCLUDE, EMPLOYEE_INCLUDE],
			subQuery: false,
		});
		res.json(enrollments.map(formatEnrollment));
	} catch (err) {
		next(err);
	}
};

const createEnrollment = async (req, res, next) => {
	try {
		const { employeeId, courseId } = req.body;

		if (req.user?.role !== 'Talento' && req.user?.employeeId !== employeeId) {
			return res.status(403).json({ status: 'fail', message: 'No podés inscribir a otro empleado.' });
		}

		const course = await Task.findByPk(courseId);
		if (!course) return res.status(404).json({ status: 'fail', message: 'Course not found' });

		const existing = await EmployeeTask.findOne({ where: { employee_id: employeeId, task_id: courseId } });
		if (existing) return res.status(409).json({ status: 'fail', message: 'Ya estás inscripto en este curso' });

		// due_date es NOT NULL en EmployeeTask pero los cursos de Learning no tienen vencimiento
		const dueDate = new Date();
		dueDate.setFullYear(dueDate.getFullYear() + 1);

		await EmployeeTask.create({
			employee_id: employeeId,
			task_id:     courseId,
			status:      EMPLOYEE_TASK.STATUS_IN_PROGRESS,
			progress:    0,
			due_date:    dueDate,
		});

		const full = await EmployeeTask.findOne({
			where:   { employee_id: employeeId, task_id: courseId },
			include: [COURSE_INCLUDE, EMPLOYEE_INCLUDE],
		});
		res.status(201).json(formatEnrollment(full));
	} catch (err) {
		next(err);
	}
};

const updateProgress = async (req, res, next) => {
	try {
		const { employeeId, taskId } = parseEnrollmentId(req.params.id);
		const { progress } = req.body;

		if (req.user?.role !== 'Talento' && req.user?.employeeId !== employeeId) {
			return res.status(403).json({ status: 'fail', message: 'No podés modificar el progreso de otro empleado.' });
		}

		if (!COURSE_ENROLLMENT.PROGRESS_STEPS.includes(progress)) {
			return res.status(400).json({ status: 'fail', message: 'Progreso inválido' });
		}

		const enrollment = await EmployeeTask.findOne({ where: { employee_id: employeeId, task_id: taskId } });
		if (!enrollment) return res.status(404).json({ status: 'fail', message: 'Enrollment not found' });
		if (enrollment.status !== EMPLOYEE_TASK.STATUS_IN_PROGRESS) {
			return res.status(400).json({ status: 'fail', message: 'No se puede modificar el progreso en este estado' });
		}

		await enrollment.update({ progress });

		const updated = await EmployeeTask.findOne({
			where:   { employee_id: employeeId, task_id: taskId },
			include: [COURSE_INCLUDE, EMPLOYEE_INCLUDE],
		});
		res.json(formatEnrollment(updated));
	} catch (err) {
		next(err);
	}
};

const requestCompletion = async (req, res, next) => {
	try {
		const { employeeId, taskId } = parseEnrollmentId(req.params.id);
		const { certificateLink } = req.body;

		if (req.user?.role !== 'Talento' && req.user?.employeeId !== employeeId) {
			return res.status(403).json({ status: 'fail', message: 'No podés solicitar la finalización del curso de otro empleado.' });
		}

		const enrollment = await EmployeeTask.findOne({
			where:   { employee_id: employeeId, task_id: taskId },
			include: [COURSE_INCLUDE],
		});
		if (!enrollment) return res.status(404).json({ status: 'fail', message: 'Enrollment not found' });
		if (enrollment.status !== EMPLOYEE_TASK.STATUS_IN_PROGRESS || enrollment.progress !== 100) {
			return res.status(400).json({ status: 'fail', message: 'El curso debe estar al 100% para solicitar la finalización' });
		}
		if (!certificateLink || !certificateLink.trim()) {
			return res.status(400).json({ status: 'fail', message: 'Subí el link del diploma para enviarlo a revisión' });
		}

		await enrollment.update({ status: EMPLOYEE_TASK.STATUS_SUBMITTED, certificate_link: certificateLink.trim() });

		Alert.create({
			employee_id: employeeId,
			type:        'COURSE_COMPLETION_REQUESTED',
			message:     `Se solicitó la aprobación de finalización del curso "${enrollment.task?.name}".`,
			status:      'UNREAD',
		}).catch(console.error);

		const updated = await EmployeeTask.findOne({
			where:   { employee_id: employeeId, task_id: taskId },
			include: [COURSE_INCLUDE, EMPLOYEE_INCLUDE],
		});
		res.json(formatEnrollment(updated));
	} catch (err) {
		next(err);
	}
};

// Certificación/curso externo registrado por el empleado: crea un Task (is_external) +
// EmployeeTask al 100% en estado SUBMITTED, listo para revisión de Talento (mismo flujo que requestCompletion)
const createExternalCertification = async (req, res, next) => {
	try {
		const { employeeId, title, description, duration, modality, skillId, institution, certificateLink } = req.body;

		if (req.user?.role !== 'Talento' && req.user?.employeeId !== employeeId) {
			return res.status(403).json({ status: 'fail', message: 'No podés registrar una certificación para otro empleado.' });
		}

		if (!title || !title.trim()) {
			return res.status(400).json({ status: 'fail', message: 'El título es obligatorio' });
		}
		if (!certificateLink || !certificateLink.trim()) {
			return res.status(400).json({ status: 'fail', message: 'Subí el link del diploma para enviarlo a revisión' });
		}

		const taskType = await getCourseTaskType();

		const course = await Task.create({
			name:         title.trim(),
			task_type_id: taskType.id,
			description:  description?.trim() || null,
			duration:     duration?.trim() || null,
			modality:     modality || null,
			skill_id:     skillId || null,
			is_external:  true,
			institution:  institution?.trim() || null,
		});

		const dueDate = new Date();
		dueDate.setFullYear(dueDate.getFullYear() + 1);

		await EmployeeTask.create({
			employee_id:     employeeId,
			task_id:         course.id,
			status:          EMPLOYEE_TASK.STATUS_SUBMITTED,
			progress:        100,
			certificate_link: certificateLink.trim(),
			due_date:        dueDate,
		});

		Alert.create({
			employee_id: employeeId,
			type:        'COURSE_COMPLETION_REQUESTED',
			message:     `Se solicitó la aprobación de una certificación externa: "${course.name}".`,
			status:      'UNREAD',
		}).catch(console.error);

		const full = await EmployeeTask.findOne({
			where:   { employee_id: employeeId, task_id: course.id },
			include: [COURSE_INCLUDE, EMPLOYEE_INCLUDE],
		});
		res.status(201).json(formatEnrollment(full));
	} catch (err) {
		next(err);
	}
};

const reviewCompletion = async (req, res, next) => {
	try {
		const { employeeId, taskId } = parseEnrollmentId(req.params.id);
		const { decision } = req.body;

		const enrollment = await EmployeeTask.findOne({
			where:   { employee_id: employeeId, task_id: taskId },
			include: [COURSE_INCLUDE],
		});
		if (!enrollment) return res.status(404).json({ status: 'fail', message: 'Enrollment not found' });
		if (enrollment.status !== EMPLOYEE_TASK.STATUS_SUBMITTED) {
			return res.status(400).json({ status: 'fail', message: 'La inscripción no está pendiente de aprobación' });
		}

		if (decision === 'approve') {
			await enrollment.update({ status: EMPLOYEE_TASK.STATUS_COMPLETED });

			// Si el curso tiene una skill asociada, registrar/actualizar la evidencia en EmployeeSkill
			// usando el diploma subido por el empleado
			const skillId = enrollment.task?.skill_id;
			if (skillId) {
				const skill = await Skill.findByPk(skillId);
				const firstLevel = skill?.levels?.[0]?.order ?? 1;

				const [employeeSkill, created] = await EmployeeSkill.findOrCreate({
					where:    { employee_id: employeeId, skill_id: skillId },
					defaults: { level: firstLevel, skill_evidence_url: enrollment.certificate_link },
				});
				if (!created) {
					await employeeSkill.update({ skill_evidence_url: enrollment.certificate_link });
				}
			}

			Alert.create({
				employee_id: employeeId,
				type:        'COURSE_COMPLETION_APPROVED',
				message:     `¡Tu finalización del curso "${enrollment.task?.name}" fue aprobada! 🎉`,
				status:      'UNREAD',
			}).catch(console.error);
		} else if (decision === 'reject') {
			if (enrollment.task?.is_external) {
				// Certificación externa: el rechazo es definitivo, se conserva el diploma como referencia
				await enrollment.update({ status: EMPLOYEE_TASK.STATUS_REJECTED });

				Alert.create({
					employee_id: employeeId,
					type:        'COURSE_COMPLETION_REJECTED',
					message:     `Tu certificación externa "${enrollment.task?.name}" fue rechazada.`,
					status:      'UNREAD',
				}).catch(console.error);
			} else {
				// Se limpia el diploma para que el empleado vuelva a subirlo al reintentar
				await enrollment.update({ status: EMPLOYEE_TASK.STATUS_IN_PROGRESS, certificate_link: null });

				Alert.create({
					employee_id: employeeId,
					type:        'COURSE_COMPLETION_REJECTED',
					message:     `Tu solicitud de finalización del curso "${enrollment.task?.name}" fue rechazada. Podés volver a intentarlo.`,
					status:      'UNREAD',
				}).catch(console.error);
			}
		} else {
			return res.status(400).json({ status: 'fail', message: 'Decisión inválida' });
		}

		const updated = await EmployeeTask.findOne({
			where:   { employee_id: employeeId, task_id: taskId },
			include: [COURSE_INCLUDE, EMPLOYEE_INCLUDE],
		});
		res.json(formatEnrollment(updated));
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllEnrollments,
	createEnrollment,
	updateProgress,
	requestCompletion,
	createExternalCertification,
	reviewCompletion,
};
