
const { LearningCourse, Skill } = require('../connection/sequelize');
const { LEARNING_COURSE } = require('../utils/constants/models.constants.js');

const COURSE_INCLUDE = [{ model: Skill, as: 'skill' }];


const core_ctrl_get_courses = async (req, res, next) => {
	try {
		const data = await LearningCourse.findAll({
			include: COURSE_INCLUDE,
			order: [['title', 'ASC']],
		});
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const core_ctrl_get_course_by_id = async (req, res, next) => {
	try {
		const { id } = req.params;
		const data = await LearningCourse.findByPk(id, { include: COURSE_INCLUDE });

		if (!data) return res.status(404).json({ message: 'Not found' });

		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const core_ctrl_create_course = async (req, res, next) => {
	try {
		const { title, description, duration, modality, link, skillId } = req.body;

		if (!LEARNING_COURSE.MODALITIES.includes(modality)) {
			return res.status(400).json({ message: 'Invalid modality' });
		}

		if (skillId) {
			const skill = await Skill.findByPk(skillId);
			if (!skill) return res.status(400).json({ message: 'Invalid skillId' });
		}

		const course = await LearningCourse.create({
			title,
			description: description?.trim() ?? '',
			duration: duration ?? null,
			modality,
			link: link ?? null,
			skill_id: skillId ?? null,
		});

		const result = await LearningCourse.findByPk(course.id, { include: COURSE_INCLUDE });
		res.status(201).json(result);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const core_ctrl_update_course = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, description, duration, modality, link, skillId } = req.body;
		const course = await LearningCourse.findByPk(id);

		if (!course) return res.status(404).json({ message: 'Not found' });

		if (modality !== undefined && !LEARNING_COURSE.MODALITIES.includes(modality)) {
			return res.status(400).json({ message: 'Invalid modality' });
		}

		let normalizedSkillId;
		if (skillId !== undefined) {
			normalizedSkillId = skillId || null;
			if (normalizedSkillId) {
				const skill = await Skill.findByPk(normalizedSkillId);
				if (!skill) return res.status(400).json({ message: 'Invalid skillId' });
			}
		}

		await course.update({
			...(title !== undefined ? { title } : {}),
			...(description !== undefined ? { description: description?.trim() ?? '' } : {}),
			...(duration !== undefined ? { duration } : {}),
			...(modality !== undefined ? { modality } : {}),
			...(link !== undefined ? { link } : {}),
			...(normalizedSkillId !== undefined ? { skill_id: normalizedSkillId } : {}),
		});

		const result = await LearningCourse.findByPk(id, { include: COURSE_INCLUDE });
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const core_ctrl_delete_course = async (req, res, next) => {
	try {
		const { id } = req.params;
		const course = await LearningCourse.findByPk(id);

		if (!course) return res.status(404).json({ message: 'Not found' });

		await course.destroy();

		res.json({ message: 'Deleted' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


module.exports = {
	core_ctrl_get_courses,
	core_ctrl_get_course_by_id,
	core_ctrl_create_course,
	core_ctrl_update_course,
	core_ctrl_delete_course,
};
