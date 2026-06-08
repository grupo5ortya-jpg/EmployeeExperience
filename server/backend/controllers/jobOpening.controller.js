
const { JobOpening, Skill, JobOpeningSkill, Department } = require('../connection/sequelize');
const { JOB_OPENING } = require('../utils/constants/models.constants.js');


const core_ctrl_get_job_openings = async (req, res, next) => {
	try {
		const data = await JobOpening.findAll({
			include: [
				{ model: Department, as: 'department' },
				{
					model: Skill,
					as: 'skills',
					through: { attributes: ['required_level'] },
				},
			],
		});
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const core_ctrl_get_job_opening_by_id = async (req, res, next) => {
	try {
			const { id } = req.params;

			const data = await JobOpening.findByPk(id, {
				include: [
					{ model: Department, as: 'department' },
					{
						model: Skill,
						as: 'skills',
						through: { attributes: ['required_level'] },
					},
				],
			});

			if (!data) return res.status(404).json({ message: 'Not found' });

			res.json(data);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	};


const core_ctrl_create_job_opening = async (req, res, next) => {
	try {
		const { title, description, departmentId, skills } = req.body;
		const department = await Department.findByPk(departmentId);
		if (!department) {
			return res.status(400).json({ message: 'Invalid departmentId' });
		}

		const job = await JobOpening.create({
			title: title,
			description: description.trim(),
			department_id: department.id,
		});

		if (skills && skills.length) {
			const records = skills.map((s) => ({
				job_opening_id: job.id,
				skill_id: s.skill_id,
				required_level: Number(s.required_level),
			}));

			await Promise.all(records.map((record) => JobOpeningSkill.create(record)));
		}

		const result = await JobOpening.findByPk(job.id, {
			include: [
				{
					model: Skill,
					as: 'skills',
					through: { attributes: ['required_level'] },
				},
			],
		});

		res.status(201).json(result);
	} catch (error) {
		res.status(500).json({
			message: error.message,
			errors: error.errors,
		});
	}
};


const core_ctrl_update_job_opening = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, description, departmentId, skills, status } = req.body;
		const job = await JobOpening.findByPk(id);

		if (!job) {
			return res.status(404).json({
				message: 'Not found',
			});
		}

		let normalizedDepartmentId;
		if (departmentId !== undefined) {
			normalizedDepartmentId =
				typeof departmentId === 'string' && departmentId.trim() !== ''
					? departmentId.trim()
					: null;

			if (normalizedDepartmentId) {
				const department = await Department.findByPk(normalizedDepartmentId);
				if (!department) {
					return res.status(400).json({ message: 'Invalid departmentId' });
				}
			}
		}

		if (status !== undefined && !JOB_OPENING.STATUS.includes(status)) {
			return res.status(400).json({ message: 'Invalid status' });
		}

		await job.update({
			title,
			description: description?.trim() ?? '',
			...(normalizedDepartmentId !== undefined ? { department_id: normalizedDepartmentId } : {}),
			...(status !== undefined ? { status } : {}),
		});

		if (Array.isArray(skills) && skills.length > 0) {
			await JobOpeningSkill.destroy({
				where: {
					job_opening_id: id,
				},
				force: true,
			});

			const records = skills.map((s) => ({
				job_opening_id: id,
				skill_id: s.skill_id,
				required_level: Number(s.required_level),
			}));
			await Promise.all(records.map((record) => JobOpeningSkill.create(record)));
		}

		const result = await JobOpening.findByPk(id, {
			include: [
				{
					model: Skill,
					as: 'skills',
					through: {
						attributes: ['required_level'],
					},
				},
			],
		});
		res.json(result);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
};


const core_ctrl_delete_job_opening = async (req, res, next) => {
	try {
		const { id } = req.params;

		const job = await JobOpening.findByPk(id);
		if (!job) return res.status(404).json({ message: 'Not found' });

		await job.destroy();

		res.json({ message: 'Deleted' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


module.exports = {
	core_ctrl_get_job_openings,
	core_ctrl_get_job_opening_by_id,
	core_ctrl_create_job_opening,
	core_ctrl_update_job_opening,
	core_ctrl_delete_job_opening
};
