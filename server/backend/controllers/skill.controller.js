
const { Skill, JobOpeningSkill, EmployeeSkill, Task } = require('../connection/sequelize');


const core_ctrl_get_skills = async (req, res) => {
	try {
		const data = await Skill.findAll();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const core_ctrl_get_skill_by_id = async (req, res) => {
	try {
		const { id } = req.params;
		const skill = await Skill.findByPk(id);
		if (!skill) {
			return res.status(404).json({ error: 'Skill not found' });
		}
		res.json(skill);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const core_ctrl_update_skill = async (req, res) => {
	try {
		const { id } = req.params;
		const skill = await Skill.findByPk(id);
		if (!skill) {
			return res.status(404).json({ error: 'Skill not found' });
		}
		await skill.update(req.body);
		res.json(skill);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const core_ctrl_delete_skill = async (req, res) => {
	try {
		const { id } = req.params;
		const skill = await Skill.findByPk(id);
		if (!skill) {
			return res.status(404).json({ error: 'Skill not found' });
		}

		// Sin onDelete en relations.js — borrar una skill en uso rompería FKs (Postgres
		// tiraría un error crudo). Se chequea uso real antes y se devuelve un 409 claro.
		const [jobOpenings, employees, courses] = await Promise.all([
			JobOpeningSkill.count({ where: { skill_id: id } }),
			EmployeeSkill.count({ where: { skill_id: id } }),
			Task.count({ where: { skill_id: id } }),
		]);
		if (jobOpenings > 0 || employees > 0 || courses > 0) {
			return res.status(409).json({
				error: 'No se puede eliminar: la skill está en uso',
				usage: { jobOpenings, employees, courses },
			});
		}

		await skill.destroy();
		res.json({ message: 'Skill deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const core_ctrl_create_skill = async (req, res) => {
	try {
		const skill = await Skill.create(req.body);
		res.status(201).json(skill);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


module.exports = {
	core_ctrl_get_skills,
	core_ctrl_create_skill,
	core_ctrl_get_skill_by_id,
    core_ctrl_update_skill,
    core_ctrl_delete_skill
};