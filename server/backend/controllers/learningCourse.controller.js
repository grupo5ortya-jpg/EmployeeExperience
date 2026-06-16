const { Task, TaskType, Skill } = require('../connection/sequelize');
const { TASK_TYPE } = require('../utils/constants/models.constants.js');
const { getCourseTaskType } = require('../utils/learning.js');

const COURSE_INCLUDE = [
	{ model: TaskType, as: 'taskType', attributes: ['id', 'name', 'sub_type'] },
	{ model: Skill, as: 'skill', attributes: ['id', 'name'] },
];

function formatCourse(t) {
	return {
		id: t.id,
		title: t.name,
		description: t.description ?? null,
		duration: t.duration ?? null,
		modality: t.modality ?? null,
		link: t.link ?? null,
		skill: t.skill ?? null,
		isExternal: t.is_external ?? false,
		institution: t.institution ?? null,
	};
}

const getAllCourses = async (req, res, next) => {
	try {
		const courses = await Task.findAll({
			where: {
				'$taskType.sub_type$': TASK_TYPE.TASK_TYPE_SUB_TYPE_COURSE,
				is_external: false,
			},
			include: COURSE_INCLUDE,
			subQuery: false,
		});
		res.json(courses.map(formatCourse));
	} catch (err) {
		next(err);
	}
};

const getCourseById = async (req, res, next) => {
	try {
		const course = await Task.findByPk(req.params.id, { include: COURSE_INCLUDE });
		if (!course) return res.status(404).json({ status: 'fail', message: 'Course not found' });
		res.json(formatCourse(course));
	} catch (err) {
		next(err);
	}
};

const createCourse = async (req, res, next) => {
	try {
		const { title, description, duration, modality, link, skillId } = req.body;
		const taskType = await getCourseTaskType();

		const course = await Task.create({
			name:         title,
			task_type_id: taskType.id,
			description:  description ?? null,
			duration:     duration ?? null,
			modality:     modality ?? null,
			link:         link ?? null,
			skill_id:     skillId ?? null,
		});

		const full = await Task.findByPk(course.id, { include: COURSE_INCLUDE });
		res.status(201).json(formatCourse(full));
	} catch (err) {
		next(err);
	}
};

const updateCourse = async (req, res, next) => {
	try {
		const course = await Task.findByPk(req.params.id);
		if (!course) return res.status(404).json({ status: 'fail', message: 'Course not found' });

		const { title, description, duration, modality, link, skillId } = req.body;
		const updates = {};
		if (title       !== undefined) updates.name        = title;
		if (description !== undefined) updates.description = description;
		if (duration    !== undefined) updates.duration    = duration;
		if (modality    !== undefined) updates.modality    = modality;
		if (link        !== undefined) updates.link        = link;
		if (skillId     !== undefined) updates.skill_id    = skillId;

		await course.update(updates);
		const updated = await Task.findByPk(course.id, { include: COURSE_INCLUDE });
		res.json(formatCourse(updated));
	} catch (err) {
		next(err);
	}
};

// paranoid: true → sets deletedAt instead of hard-deleting (preserva historial de EmployeeTask)
const deleteCourse = async (req, res, next) => {
	try {
		const course = await Task.findByPk(req.params.id);
		if (!course) return res.status(404).json({ status: 'fail', message: 'Course not found' });
		await course.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllCourses,
	getCourseById,
	createCourse,
	updateCourse,
	deleteCourse,
};
