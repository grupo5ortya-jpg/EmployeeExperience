
module.exports = async function (sequelize) {
	const { Question, QuestionType, QuestionOption } = sequelize.models;

	const count = await Question.count();
	if (count > 0) {
		return;
	}

	const questionTypes = await QuestionType.findAll();
	const typeByKey = questionTypes.reduce((acc, type) => {
		acc[`${type.name}:${type.sub_type}`] = type.id;
		return acc;
	}, {});

	const closedOptions = [
		{ label: 'Totalmente en desacuerdo', value: 1, order: 1 },
		{ label: 'En desacuerdo', value: 2, order: 2 },
		{ label: 'Ni de acuerdo ni en desacuerdo', value: 3, order: 3 },
		{ label: 'De acuerdo', value: 4, order: 4 },
		{ label: 'Totalmente de acuerdo', value: 5, order: 5 },
	];

	const questions = [
		{
			question_type_id: typeByKey['Onboarding:Bienvenida'],
			text: '¿Cómo calificarías la claridad de tu proceso de bienvenida?',
			type: 'Cerrada',
			estimated_duration: 3,
		},
		{
			question_type_id: typeByKey['Onboarding:Bienvenida'],
			text: '¿Te entregaron la documentación necesaria a tiempo?',
			type: 'Cerrada',
			estimated_duration: 3,
		},
		{
			question_type_id: typeByKey['Onboarding:Bienvenida'],
			text: '¿Sentiste acompañamiento adecuado durante tu primer día?',
			type: 'Cerrada',
			estimated_duration: 3,
		},
		{
			question_type_id: typeByKey['Onboarding:Bienvenida'],
			text: '¿La capacitación inicial te ayudó a entender tu rol?',
			type: 'Cerrada',
			estimated_duration: 3,
		},
		{
			question_type_id: typeByKey['Onboarding:Bienvenida'],
			text: 'Describe en una frase tu experiencia inicial con el equipo.',
			type: 'Abierta',
			estimated_duration: 1,
		},
		// ── Feedback 360° — 2 preguntas por competencia ─────────────
		{ question_type_id: typeByKey['Feedback360:communication'],   text: '¿Cómo evaluás las habilidades de comunicación de esta persona?',         type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:communication'],   text: '¿Con qué claridad comparte información con el resto del equipo?',         type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:leadership'],      text: '¿Cómo valorás la capacidad de liderazgo de esta persona?',               type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:leadership'],      text: '¿En qué medida motiva e inspira a sus compañeros de equipo?',            type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:teamwork'],        text: '¿Qué tan efectivamente colabora esta persona con el equipo?',            type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:teamwork'],        text: '¿Cómo contribuye al clima de trabajo y la cohesión grupal?',             type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:problem_solving'], text: '¿Qué tan efectiva es esta persona al resolver problemas complejos?',     type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:problem_solving'], text: '¿Con qué creatividad aborda situaciones o desafíos inesperados?',        type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:proactivity'],     text: '¿Qué tan proactiva es esta persona en sus iniciativas?',                 type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:proactivity'],     text: '¿Con qué frecuencia identifica mejoras sin que se le solicite?',         type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:adaptability'],    text: '¿Cómo se adapta esta persona ante cambios o nuevas situaciones?',        type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:adaptability'],    text: '¿Qué tan bien maneja la presión y la incertidumbre en el trabajo?',      type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:results'],         text: '¿Qué tan comprometida está esta persona con los resultados del equipo?', type: 'Cerrada', estimated_duration: 1 },
		{ question_type_id: typeByKey['Feedback360:results'],         text: '¿Qué tan consistentemente cumple sus objetivos y entregables?',          type: 'Cerrada', estimated_duration: 1 },
		{
			question_type_id: typeByKey['Pulso:30'],
			text: '¿Te sientes valorado por tu equipo?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:30'],
			text: '¿La comunicación interna es clara en tu área?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:30'],
			text: '¿Tu carga de trabajo es equilibrada?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:30'],
			text: '¿Sientes que tienes oportunidades de desarrollo en este rol?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:30'],
			text: '¿Cómo te sentis en el entorno de trabajo?',
			type: 'Abierta',
			estimated_duration: 1,
		},
		// ── Pulso: 60 días ───────────────────────────────────────
		{
			question_type_id: typeByKey['Pulso:60'],
			text: '¿Te sentís integrado/a al equipo después de dos meses?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:60'],
			text: '¿Tus responsabilidades actuales coinciden con lo que esperabas al ingresar?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:60'],
			text: '¿Recibiste el acompañamiento necesario para desarrollar tu trabajo?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:60'],
			text: '¿Te sentís cómodo/a consultando dudas con tu equipo o líder?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:60'],
			text: '¿Qué es lo que más te está costando adaptarte hasta ahora?',
			type: 'Abierta',
			estimated_duration: 2,
		},
		// ── Pulso: 90 días ───────────────────────────────────────
		{
			question_type_id: typeByKey['Pulso:90'],
			text: '¿Sentís que tu aporte es valorado dentro del equipo?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:90'],
			text: '¿Tenés claridad sobre tus objetivos y prioridades a corto plazo?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:90'],
			text: '¿La cultura de la empresa se alinea con tus valores personales?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:90'],
			text: '¿Ves oportunidades de crecimiento en tu rol a mediano plazo?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:90'],
			text: '¿Qué cambiarías de tu experiencia en estos primeros tres meses y como te sentiste con el entorno?',
			type: 'Abierta',
			estimated_duration: 2,
		},
		// ── Offboarding ──────────────────────────────────────────
		{
			question_type_id: typeByKey['Offboarding:Salida'],
			text: '¿El proceso de salida fue claro y ordenado?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Offboarding:Salida'],
			text: '¿Recibiste el apoyo necesario para planificar tu salida?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Offboarding:Salida'],
			text: '¿Se respetaron los plazos acordados en tu desvinculación?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Offboarding:Salida'],
			text: '¿Tu entrevista de salida fue respetuosa y útil?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Offboarding:Salida'],
			text: '¿Qué sugerencias tienes para mejorar el proceso de salida?',
			type: 'Abierta',
			estimated_duration: 2,
		},
	];

	const createdQuestions = await Question.bulkCreate(questions, { returning: true });

	const optionsData = createdQuestions
		.filter((question) => question.type === 'Cerrada')
		.flatMap((question) =>
			closedOptions.map((option, index) => ({
				question_id: question.id,
				label: option.label,
				value: option.value,
				order: option.order,
			}))
		);

	if (optionsData.length > 0) {
		await QuestionOption.bulkCreate(optionsData);
	}
};
