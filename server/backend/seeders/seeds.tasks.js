module.exports = async function (sequelize) {
	const { Task, TaskType } = sequelize.models;

	const count = await Task.count();
	if (count > 0) {
		return;
	}

	const taskTypes = await TaskType.findAll();
	const taskTypeByKey = taskTypes.reduce((acc, type) => {
		const key = `${type.name}`//:${type.sub_type}`;
		acc[key] = type.id;
		return acc;
	}, {});

	const tasks = [
		{
			name: 'Completar checklist de bienvenida',
			task_type_id: taskTypeByKey['Onboarding estándar'],
			estimated_duration: 2,
		},
		{
			name: 'Revisar políticas internas',
			task_type_id: taskTypeByKey['Onboarding estándar'],
			estimated_duration: 1,
		},
		{
			name: 'Firmar contrato y documentación de alta',
			task_type_id: taskTypeByKey['Onboarding estándar'],
			estimated_duration: 1,
		},
		{
			name: 'Subir credenciales y formularios obligatorios',
			task_type_id: taskTypeByKey['Onboarding estándar'],
			estimated_duration: 1,
		},
		{
			name: 'Reunión de bienvenida con el líder',
			task_type_id: taskTypeByKey['Onboarding estándar'],
			estimated_duration: 1,
		},
		{
			name: 'Presentarse al equipo y conocer responsabilidades',
			task_type_id: taskTypeByKey['Onboarding estándar'],
			estimated_duration: 1,
		},
		{
			name: 'Devolver notebook y tarjetas de acceso',
			task_type_id: taskTypeByKey['Offboarding estándad'],
			estimated_duration: 1,
		},
		{
			name: 'Completar checklist de salida con RRHH',
			task_type_id: taskTypeByKey['Offboarding estándad'],
			estimated_duration: 1,
		},
		{
			name: 'Entrevista de salida con RRHH',
			task_type_id: taskTypeByKey['Offboarding estándad'],
			estimated_duration: 1,
		},
		{
			name: 'Completar curso de inducción digital',
			task_type_id: taskTypeByKey['Aprendizaje - curso'],
			estimated_duration: 3,
		},
		{
			name: 'Participar en workshop de habilidades blandas',
			task_type_id: taskTypeByKey['Aprendizaje - curso'],
			estimated_duration: 2,
		},
		{
			name: 'Obtener certificación de seguridad informática',
			task_type_id: taskTypeByKey['Aprendizaje - certificarse'],
			estimated_duration: 5,
		},
		{
			name: 'Completar certificación de compliance',
			task_type_id: taskTypeByKey['Aprendizaje - certificarse'],
			estimated_duration: 4,
		},
		{
			name: 'Completar autoevaluación semestral',
			task_type_id: taskTypeByKey['Desempeño - feedback 360'],
			estimated_duration: 2,
		},
		{
			name: 'Enviar evaluación a pares y líder',
			task_type_id: taskTypeByKey['Desempeño - feedback 360'],
			estimated_duration: 2,
		},
		{
			name: 'Registrar reconocimiento a un colega',
			task_type_id: taskTypeByKey['Desempeño - reconocimiento'],
			estimated_duration: 1,
		},
		{
			name: 'Solicitar acceso a la intranet corporativa',
			task_type_id: taskTypeByKey['Administrativo - acceso'],
			estimated_duration: 1,
		},
		{
			name: 'Revisar permisos y accesos asignados',
			task_type_id: taskTypeByKey['Administrativo - acceso'],
			estimated_duration: 1,
		},
	];

	const missingTypes = tasks.filter((task) => !task.task_type_id);
	if (missingTypes.length > 0) {
		throw new Error(`Missing TaskType for some seeded tasks: ${missingTypes.map((task) => task.name).join(', ')}`);
	}

	await Task.bulkCreate(tasks);
};
