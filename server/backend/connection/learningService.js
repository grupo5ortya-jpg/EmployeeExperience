const { Alert, CourseEnrollment } = require('./sequelize');
const { COURSE_ENROLLMENT } = require('../utils/constants/models.constants.js');

async function enrollEmployee(employeeId, courseId) {
	const existing = await CourseEnrollment.findOne({
		where: { employee_id: employeeId, course_id: courseId },
	});
	if (existing) {
		const error = new Error('El empleado ya está inscripto en este curso');
		error.status = 400;
		throw error;
	}

	return CourseEnrollment.create({
		employee_id: employeeId,
		course_id: courseId,
		progress: 0,
		status: COURSE_ENROLLMENT.STATUS_IN_PROGRESS,
	});
}

async function updateProgress(enrollment, progress) {
	if (!COURSE_ENROLLMENT.PROGRESS_STEPS.includes(progress)) {
		const error = new Error('Progreso inválido');
		error.status = 400;
		throw error;
	}

	await enrollment.update({ progress });
	return enrollment;
}

async function requestCompletion(enrollment) {
	if (enrollment.status !== COURSE_ENROLLMENT.STATUS_IN_PROGRESS || enrollment.progress !== 100) {
		const error = new Error('Solo se puede solicitar finalización con el curso al 100% de progreso');
		error.status = 400;
		throw error;
	}

	await enrollment.update({ status: COURSE_ENROLLMENT.STATUS_PENDING_APPROVAL });

	await Alert.create({
		employee_id: enrollment.employee_id,
		type: 'COURSE_COMPLETION_REQUESTED',
		message: 'Un empleado solicitó la validación de finalización de un curso.',
		status: 'UNREAD',
	});

	return enrollment;
}

async function reviewCompletion(enrollment, decision, certificateLink) {
	if (enrollment.status !== COURSE_ENROLLMENT.STATUS_PENDING_APPROVAL) {
		const error = new Error('La inscripción no tiene una solicitud de finalización pendiente');
		error.status = 400;
		throw error;
	}

	if (decision === 'approve') {
		await enrollment.update({
			status: COURSE_ENROLLMENT.STATUS_COMPLETED,
			certificate_link: certificateLink ?? null,
		});

		await Alert.create({
			employee_id: enrollment.employee_id,
			type: 'COURSE_COMPLETION_APPROVED',
			message: 'Tu solicitud de finalización de curso fue aprobada. ¡Felicitaciones!',
			status: 'UNREAD',
		});
	} else {
		await enrollment.update({ status: COURSE_ENROLLMENT.STATUS_IN_PROGRESS });

		await Alert.create({
			employee_id: enrollment.employee_id,
			type: 'COURSE_COMPLETION_REJECTED',
			message: 'Tu solicitud de finalización de curso fue rechazada. Revisa tu progreso y volvé a solicitarla.',
			status: 'UNREAD',
		});
	}

	return enrollment;
}

module.exports = {
	enrollEmployee,
	updateProgress,
	requestCompletion,
	reviewCompletion,
};
