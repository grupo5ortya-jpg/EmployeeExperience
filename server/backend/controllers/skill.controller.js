
const { Skill } = require('../connection/sequelize');


const core_ctrl_get_skills = async (req, res) => {
	try {
		const data = await Skill.findAll();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}


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
	core_ctrl_create_skill
};