
module.exports = async (sequelize) => {
	const { JobOpening, Skill, JobOpeningSkill } = sequelize.models;

	const count = await JobOpeningSkill.count();
	if (count > 0) return;

	const openings = await JobOpening.findAll();
	const skills = await Skill.findAll();

	if (openings.length === 0 || skills.length === 0) return;

	const getValidLevel = (skill, preferred) => {
		const levels = Array.isArray(skill.levels) ? skill.levels : [];
		const validOrders = levels
			.map((level) => Number(level.order))
			.filter((order) => Number.isInteger(order));

		if (validOrders.length === 0) {
			throw new Error(`Skill ${skill.name} no tiene niveles válidos`);
		}

		if (validOrders.includes(preferred)) {
			return preferred;
		}

		const sorted = [...new Set(validOrders)].sort((a, b) => a - b);
		if (preferred < sorted[0]) return sorted[0];
		if (preferred > sorted[sorted.length - 1]) return sorted[sorted.length - 1];
		return sorted[Math.floor(sorted.length / 2)];
	};

	const rows = [
		{ openingIndex: 0, skillIndex: 0, preferredLevel: 4 },
		{ openingIndex: 0, skillIndex: 1, preferredLevel: 3 },
		{ openingIndex: 0, skillIndex: 2, preferredLevel: 5 },
		{ openingIndex: 1, skillIndex: 3, preferredLevel: 2 },
		{ openingIndex: 1, skillIndex: 4, preferredLevel: 4 },
		{ openingIndex: 2, skillIndex: 5, preferredLevel: 5 },
	];

	const payload = rows.map(({ openingIndex, skillIndex, preferredLevel }) => {
		const skill = skills[skillIndex];
		const opening = openings[openingIndex];

		if (!skill || !opening) {
			throw new Error('No se pudo encontrar apertura o skill para el seed de JobOpeningSkill');
		}

		return {
			job_opening_id: opening.id,
			skill_id: skill.id,
			required_level: getValidLevel(skill, preferredLevel),
		};
	});

	await JobOpeningSkill.bulkCreate(payload, { individualHooks: true, validate: true });

	console.log('JobOpeningSkills seeded');
};