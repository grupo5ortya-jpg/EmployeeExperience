module.exports = async function (sequelize) {
	const { TaskType } = sequelize.models;

	const count = await TaskType.count();
	if (count > 0) {
		return;
	}

	const taskTypes = [
		{ name: 'Onboarding', sub_type: 'Checklist' },
		{ name: 'Onboarding', sub_type: 'Documentación' },
		{ name: 'Onboarding', sub_type: 'Integración' },
		{ name: 'Offboarding', sub_type: 'Checklist' },
		{ name: 'Offboarding', sub_type: 'Entrevista de salida' },
		{ name: 'Aprendizaje', sub_type: 'Curso' },
		{ name: 'Aprendizaje', sub_type: 'Certificación' },
		{ name: 'Desempeño', sub_type: 'Evaluación 360' },
		{ name: 'Desempeño', sub_type: 'Reconocimiento' },
		{ name: 'Administrativo', sub_type: 'Accesos' },
	];

	await TaskType.bulkCreate(taskTypes);
};
