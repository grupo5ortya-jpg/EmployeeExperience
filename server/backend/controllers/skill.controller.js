
const { Skill } = require('../connection/sequelize');


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