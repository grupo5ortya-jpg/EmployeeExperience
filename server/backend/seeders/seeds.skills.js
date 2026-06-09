
module.exports = async function (sequelize) {
	const { Skill } = sequelize.models;

	const { SKILL } = require('../utils/constants/models.constants.js');
	const count = await Skill.count();
	if (count > 0) return;

	await Skill.bulkCreate([
		// HARD
		{ name: 'Node.js', type: SKILL.TYPES_HARD, levels: SKILL.DEFAULT_HARD_LEVELS },
		{ name: 'React', type: SKILL.TYPES_HARD, levels: SKILL.DEFAULT_HARD_LEVELS },
		{ name: 'PostgreSQL', type: SKILL.TYPES_HARD, levels: SKILL.DEFAULT_HARD_LEVELS },
		{ name: 'Docker', type: SKILL.TYPES_HARD, levels: SKILL.DEFAULT_HARD_LEVELS },
		{ name: 'Sequelize ORM', type: SKILL.TYPES_HARD, levels: SKILL.DEFAULT_HARD_LEVELS },

		// SOFT
		{ name: 'Communication', type: SKILL.TYPES_SOFT, levels: SKILL.DEFAULT_SOFT_LEVELS },
		{ name: 'Teamwork', type: SKILL.TYPES_SOFT, levels: SKILL.DEFAULT_SOFT_LEVELS },
		{ name: 'Problem Solving', type: SKILL.TYPES_SOFT, levels: SKILL.DEFAULT_SOFT_LEVELS },
		{ name: 'Time Management', type: SKILL.TYPES_SOFT, levels: SKILL.DEFAULT_SOFT_LEVELS },
		{ name: 'Adaptability', type: SKILL.TYPES_SOFT, levels: SKILL.DEFAULT_SOFT_LEVELS },
		{ name: 'Leadership', type: SKILL.TYPES_SOFT, levels: SKILL.DEFAULT_SOFT_LEVELS },
		{ name: 'Problem solving', type: SKILL.TYPES_SOFT, levels: SKILL.DEFAULT_SOFT_LEVELS },
		{ name: 'Proactivity', type: SKILL.TYPES_SOFT, levels: SKILL.DEFAULT_SOFT_LEVELS },
		{ name: 'Results oriented', type: SKILL.TYPES_SOFT, levels: SKILL.DEFAULT_SOFT_LEVELS },
		{ name: 'English', type: SKILL.TYPES_SOFT, levels: [ { "name": "A1", "order": 1 }, { "name": "A2", "order": 2 }, { "name": "B1", "order": 3 }, { "name": "B2", "order": 4 }, { "name": "C1", "order": 5 }, { "name": "C2", "order": 6 } ] },

	]);
};
