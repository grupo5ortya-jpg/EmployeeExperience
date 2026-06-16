
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

	const sapTasks = [
		{
			name: 'Capacitación SAP FI (Financial Accounting - Finanzas)',
			task_type_id: taskTypeByKey['SAP FI (Financial Accounting - Finanzas)'],
			estimated_duration: 84,
		},
		{
			name: 'Capacitación SAP CO (Controlling - Control de Costos)',
			task_type_id: taskTypeByKey['SAP CO (Controlling - Control de Costos)'],
			estimated_duration: 70,
		},
		{
			name: 'Capacitación SAP MM (Materials Management - Gestión de Materiales)',
			task_type_id: taskTypeByKey['SAP MM (Materials Management - Gestión de Materiales)'],
			estimated_duration: 84,
		},
		{
			name: 'Capacitación SAP SD (Sales and Distribution - Ventas y Distribución)',
			task_type_id: taskTypeByKey['SAP SD (Sales and Distribution - Ventas y Distribución)'],
			estimated_duration: 70,
		},
		{
			name: 'Capacitación SAP PP (Production Planning - Planificación de la Producción)',
			task_type_id: taskTypeByKey['SAP PP (Production Planning - Planificación de la Producción)'],
			estimated_duration: 70,
		},
		{
			name: 'Capacitación SAP HCM (Human Capital Management - Recursos Humanos)',
			task_type_id: taskTypeByKey['SAP HCM (Human Capital Management - Recursos Humanos)'],
			estimated_duration: 70,
		},
		{
			name: 'Capacitación SAP PM (Plant Maintenance - Mantenimiento de Planta)',
			task_type_id: taskTypeByKey['SAP PM (Plant Maintenance - Mantenimiento de Planta)'],
			estimated_duration: 56,
		},
		{
			name: 'Capacitación SAP QM (Quality Management - Gestión de Calidad)',
			task_type_id: taskTypeByKey['SAP QM (Quality Management - Gestión de Calidad)'],
			estimated_duration: 56,
		},
		{
			name: 'Capacitación SAP PS (Project System - Sistema de Proyectos)',
			task_type_id: taskTypeByKey['SAP PS (Project System - Sistema de Proyectos)'],
			estimated_duration: 70,
		},
		{
			name: 'Capacitación SAP WM (Warehouse Management)',
			task_type_id: taskTypeByKey['SAP WM (Warehouse Management)'],
			estimated_duration: 70,
		},
		{
			name: 'Capacitación SAP EWM (Extended Warehouse Management)',
			task_type_id: taskTypeByKey['SAP EWM (Extended Warehouse Management)'],
			estimated_duration: 56,
		},
		{
			name: 'Capacitación SAP CS (Customer Service - Servicio al Cliente)',
			task_type_id: taskTypeByKey['SAP CS (Customer Service - Servicio al Cliente)'],
			estimated_duration: 56,
		},
		{
			name: 'Capacitación SAP SCM (Supply Chain Management - Cadena de Suministro)',
			task_type_id: taskTypeByKey['SAP SCM (Supply Chain Management - Cadena de Suministro)'],
			estimated_duration: 84,
		},
		{
			name: 'Capacitación SAP CRM (Customer Relationship Management)',
			task_type_id: taskTypeByKey['SAP CRM (Customer Relationship Management)'],
			estimated_duration: 56,
		},
		{
			name: 'Capacitación SAP ABAP',
			task_type_id: taskTypeByKey['SAP ABAP'],
			estimated_duration: 84,
		},
		{
			name: 'Capacitación SAP BASIS',
			task_type_id: taskTypeByKey['SAP BASIS'],
			estimated_duration: 56,
		},
		{
			name: 'Capacitación SAP NetWeaver',
			task_type_id: taskTypeByKey['SAP NetWeaver'],
			estimated_duration: 70,
		},
		{
			name: 'Capacitación SAP Solution Manager (SolMan)',
			task_type_id: taskTypeByKey['SAP Solution Manager (SolMan)'],
			estimated_duration: 35,
		},
		{
			name: 'Capacitación SAP Workflow',
			task_type_id: taskTypeByKey['SAP Workflow'],
			estimated_duration: 35,
		},
		{
			name: 'Capacitación SAP Enterprise Portal',
			task_type_id: taskTypeByKey['SAP Enterprise Portal'],
			estimated_duration: 35,
		},
	];

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
			description: 'Curso introductorio sobre las herramientas digitales, políticas internas y cultura de la empresa.',
			duration: '3 horas',
			modality: 'Online',
		},
		{
			name: 'Participar en workshop de habilidades blandas',
			task_type_id: taskTypeByKey['Aprendizaje - curso'],
			estimated_duration: 2,
			description: 'Taller práctico para desarrollar comunicación, trabajo en equipo y resolución de conflictos.',
			duration: '2 horas',
			modality: 'Presencial',
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

	await Task.bulkCreate(sapTasks, { individualHooks: true });
	await Task.bulkCreate(tasks, { individualHooks: true });
};
