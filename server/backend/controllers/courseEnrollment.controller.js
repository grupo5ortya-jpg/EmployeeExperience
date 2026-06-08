
const { CourseEnrollment, LearningCourse, Employee, Person, Skill } = require('../connection/sequelize');
const learningService = require('../connection/learningService');

const ENROLLMENT_INCLUDE = [
	{ model: LearningCourse, as: 'course', include: [{ model: Skill, as: 'skill' }] },
	{ model: Employee, as: 'employee', include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }] },
];


const core_ctrl_get_enrollments = async (req, res, next) => {
	try {
		const { employeeId, courseId, status } = req.query;
		const where = {};
		if (employeeId) where.employee_id = employeeId;
		if (courseId) where.course_id = courseId;
		if (status) where.status = status;

		const data = await CourseEnrollment.findAll({
			where,
			include: ENROLLMENT_INCLUDE,
			order: [['createdAt', 'DESC']],
		});
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const core_ctrl_create_enrollment = async (req, res, next) => {
	try {
		const { employeeId, courseId } = req.body;

		const [employee, course] = await Promise.all([
			Employee.findByPk(employeeId),
			LearningCourse.findByPk(courseId),
		]);
		if (!employee) return res.status(400).json({ message: 'Invalid employeeId' });
		if (!course) return res.status(400).json({ message: 'Invalid courseId' });

		const enrollment = await learningService.enrollEmployee(employeeId, courseId);

		const result = await CourseEnrollment.findByPk(enrollment.id, { include: ENROLLMENT_INCLUDE });
		res.status(201).json(result);
	} catch (error) {
		res.status(error.status ?? 500).json({ message: error.message });
	}
};


const core_ctrl_update_progress = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { progress } = req.body;

		const enrollment = await CourseEnrollment.findByPk(id);
		if (!enrollment) return res.status(404).json({ message: 'Not found' });

		await learningService.updateProgress(enrollment, Number(progress));

		const result = await CourseEnrollment.findByPk(id, { include: ENROLLMENT_INCLUDE });
		res.json(result);
	} catch (error) {
		res.status(error.status ?? 500).json({ message: error.message });
	}
};


const core_ctrl_request_completion = async (req, res, next) => {
	try {
		const { id } = req.params;

		const enrollment = await CourseEnrollment.findByPk(id);
		if (!enrollment) return res.status(404).json({ message: 'Not found' });

		await learningService.requestCompletion(enrollment);

		const result = await CourseEnrollment.findByPk(id, { include: ENROLLMENT_INCLUDE });
		res.json(result);
	} catch (error) {
		res.status(error.status ?? 500).json({ message: error.message });
	}
};


const core_ctrl_review_completion = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { decision, certificateLink } = req.body;

		if (!['approve', 'reject'].includes(decision)) {
			return res.status(400).json({ message: 'Invalid decision' });
		}

		const enrollment = await CourseEnrollment.findByPk(id);
		if (!enrollment) return res.status(404).json({ message: 'Not found' });

		await learningService.reviewCompletion(enrollment, decision, certificateLink);

		const result = await CourseEnrollment.findByPk(id, { include: ENROLLMENT_INCLUDE });
		res.json(result);
	} catch (error) {
		res.status(error.status ?? 500).json({ message: error.message });
	}
};


module.exports = {
	core_ctrl_get_enrollments,
	core_ctrl_create_enrollment,
	core_ctrl_update_progress,
	core_ctrl_request_completion,
	core_ctrl_review_completion,
};
