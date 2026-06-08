
module.exports = async (sequelize) => {
	const { LearningCourse, Skill } = sequelize.models;

	const count = await LearningCourse.count();
	if (count > 0) return;

	const skills = await Skill.findAll();
	const skillId = (name) => skills.find((s) => s.name === name)?.id ?? null;

	await LearningCourse.bulkCreate([
		{
			title: 'Spring Boot Advanced',
			description: 'Construcción de servicios backend avanzados con Spring Boot y buenas prácticas de arquitectura.',
			duration: '12 horas',
			modality: 'Online',
			link: 'https://www.udemy.com/course/spring-boot-advanced',
			skill_id: skillId('Node.js'),
		},
		{
			title: 'React Fundamentals',
			description: 'Bases sólidas de React: componentes, hooks, manejo de estado y enrutamiento.',
			duration: '10 horas',
			modality: 'Online',
			link: 'https://www.udemy.com/course/react-fundamentals',
			skill_id: skillId('React'),
		},
		{
			title: 'PostgreSQL para desarrolladores',
			description: 'Modelado de datos, consultas avanzadas y optimización de performance en PostgreSQL.',
			duration: '8 horas',
			modality: 'Online',
			link: 'https://www.udemy.com/course/postgresql-para-desarrolladores',
			skill_id: skillId('PostgreSQL'),
		},
		{
			title: 'Docker y contenedores',
			description: 'Empaquetado y despliegue de aplicaciones con Docker, desde cero hasta producción.',
			duration: '6 horas',
			modality: 'Online',
			link: 'https://www.udemy.com/course/docker-y-contenedores',
			skill_id: skillId('Docker'),
		},
		{
			title: 'Comunicación efectiva en equipos de trabajo',
			description: 'Herramientas prácticas para mejorar la comunicación interpersonal y la colaboración.',
			duration: '4 horas',
			modality: 'Híbrida',
			link: 'https://www.coursera.org/learn/comunicacion-efectiva',
			skill_id: skillId('Communication'),
		},
		{
			title: 'Liderazgo de equipos',
			description: 'Fundamentos de liderazgo, delegación y gestión de personas para líderes de equipo.',
			duration: '8 horas',
			modality: 'Presencial',
			link: 'https://www.coursera.org/learn/liderazgo-de-equipos',
			skill_id: skillId('Leadership'),
		},
		{
			title: 'Gestión del tiempo y productividad',
			description: 'Técnicas de organización personal, priorización de tareas y manejo de plazos.',
			duration: '3 horas',
			modality: 'Online',
			link: 'https://www.coursera.org/learn/gestion-del-tiempo',
			skill_id: skillId('Time Management'),
		},
		{
			title: 'SAP FI/CO — Fundamentos',
			description: 'Introducción al módulo financiero de SAP: configuración, procesos y reportes.',
			duration: '16 horas',
			modality: 'Online',
			link: 'https://www.udemy.com/course/sap-fico-fundamentos',
			skill_id: skillId('SAP FI/CO'),
		},
	]);

	console.log('LearningCourses seeded');
};
