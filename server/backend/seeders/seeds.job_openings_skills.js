
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

	const mappings = [
		// Contabilidad
		{ openingTitle: 'Analista Contable', skillName: 'Time Management', preferredLevel: 3 },
		{ openingTitle: 'Analista Contable', skillName: 'Results oriented', preferredLevel: 3 },
		{ openingTitle: 'Analista SAP FI/CO', skillName: 'SAP FI/CO', preferredLevel: 4 },
		{ openingTitle: 'Analista SAP FI/CO', skillName: 'SAP ERP', preferredLevel: 3 },
		{ openingTitle: 'Tesorero', skillName: 'Time Management', preferredLevel: 3 },
		{ openingTitle: 'Tesorero', skillName: 'Problem Solving', preferredLevel: 3 },
		{ openingTitle: 'Auditor Interno', skillName: 'Problem Solving', preferredLevel: 4 },
		{ openingTitle: 'Auditor Interno', skillName: 'Communication', preferredLevel: 3 },

		// Ventas
		{ openingTitle: 'Ejecutivo de Ventas', skillName: 'Communication', preferredLevel: 4 },
		{ openingTitle: 'Ejecutivo de Ventas', skillName: 'Results oriented', preferredLevel: 3 },
		{ openingTitle: 'Analista SAP SD', skillName: 'SAP SD', preferredLevel: 4 },
		{ openingTitle: 'Analista SAP SD', skillName: 'Communication', preferredLevel: 3 },
		{ openingTitle: 'Account Manager', skillName: 'Communication', preferredLevel: 4 },
		{ openingTitle: 'Account Manager', skillName: 'Leadership', preferredLevel: 3 },
		{ openingTitle: 'Representante Comercial', skillName: 'Communication', preferredLevel: 3 },
		{ openingTitle: 'Representante Comercial', skillName: 'Proactivity', preferredLevel: 3 },

		// Marketing
		{ openingTitle: 'Analista de Marketing Digital', skillName: 'Communication', preferredLevel: 3 },
		{ openingTitle: 'Analista de Marketing Digital', skillName: 'Adaptability', preferredLevel: 3 },
		{ openingTitle: 'Diseñador Gráfico', skillName: 'Adaptability', preferredLevel: 3 },
		{ openingTitle: 'Diseñador Gráfico', skillName: 'Proactivity', preferredLevel: 3 },
		{ openingTitle: 'Community Manager', skillName: 'Communication', preferredLevel: 4 },
		{ openingTitle: 'Community Manager', skillName: 'Adaptability', preferredLevel: 3 },
		{ openingTitle: 'Consultor SAP CRM', skillName: 'SAP CRM', preferredLevel: 4 },
		{ openingTitle: 'Consultor SAP CRM', skillName: 'Communication', preferredLevel: 3 },

		// Desarrollo
		{ openingTitle: 'Backend Developer', skillName: 'Node.js', preferredLevel: 4 },
		{ openingTitle: 'Backend Developer', skillName: 'PostgreSQL', preferredLevel: 3 },
		{ openingTitle: 'Frontend Developer', skillName: 'React', preferredLevel: 4 },
		{ openingTitle: 'Frontend Developer', skillName: 'Adaptability', preferredLevel: 3 },
		{ openingTitle: 'DevOps Engineer', skillName: 'Docker', preferredLevel: 4 },
		{ openingTitle: 'DevOps Engineer', skillName: 'Problem Solving', preferredLevel: 3 },
		{ openingTitle: 'Consultor SAP ABAP', skillName: 'SAP ABAP', preferredLevel: 4 },
		{ openingTitle: 'Consultor SAP ABAP', skillName: 'SAP ERP', preferredLevel: 3 },
	];

	const payload = mappings.map(({ openingTitle, skillName, preferredLevel }) => {
		const opening = openings.find((o) => o.title === openingTitle);
		const skill = skills.find((s) => s.name === skillName);

		if (!opening || !skill) {
			throw new Error(`No se pudo encontrar apertura "${openingTitle}" o skill "${skillName}" para el seed de JobOpeningSkill`);
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
