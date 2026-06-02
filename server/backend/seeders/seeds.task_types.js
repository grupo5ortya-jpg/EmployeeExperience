module.exports = async function (sequelize) {
	const { TaskType } = sequelize.models;

	const count = await TaskType.count();
	if (count > 0) {
		return;
	}

	const taskTypes = [
		{ name: 'Onboarding estándar', sub_type: 'Checklist' },
		{ name: 'Onboarding contabilidad', sub_type: 'Documentación' },
		{ name: 'Onboarding líderes', sub_type: 'Integración' },
		{ name: 'Offboarding estándad', sub_type: 'Checklist' },
		{ name: 'Offboarding prueba', sub_type: 'Entrevista de salida' },
		{ name: 'Aprendizaje - curso', sub_type: 'Curso' },
		{ name: 'Aprendizaje - certificarse', sub_type: 'Certificación' },
		{ name: 'Desempeño - feedback 360', sub_type: 'Evaluación 360' },
		{ name: 'Desempeño - reconocimiento', sub_type: 'Reconocimiento' },
		{ name: 'Administrativo - acceso', sub_type: 'Accesos' },
	];

	await TaskType.bulkCreate(taskTypes, { individualHooks: true });
};
