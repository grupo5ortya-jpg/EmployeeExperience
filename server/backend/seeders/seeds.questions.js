
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
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Onboarding:Bienvenida'],
			text: '¿Te entregaron la documentación necesaria a tiempo?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Onboarding:Bienvenida'],
			text: '¿Sentiste acompañamiento adecuado durante tu primer día?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Onboarding:Bienvenida'],
			text: '¿La capacitación inicial te ayudó a entender tu rol?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Onboarding:Bienvenida'],
			text: 'Describe en una frase tu experiencia inicial con el equipo.',
			type: 'Abierta',
			estimated_duration: 2,
		},
		{
			question_type_id: typeByKey['Desempeño:Feedback 360'],
			text: '¿Tu líder te brindó feedback constructivo recientemente?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Desempeño:Feedback 360'],
			text: '¿Consideras que tus objetivos están claros y alineados?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Desempeño:Feedback 360'],
			text: '¿Tus evaluaciones cubren tus fortalezas y áreas de mejora?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Desempeño:Feedback 360'],
			text: '¿Puedes aplicar lo que aprendes en tu trabajo diario?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Desempeño:Feedback 360'],
			text: '¿Qué mejorarías en el seguimiento de tu desempeño?',
			type: 'Abierta',
			estimated_duration: 2,
		},
		{
			question_type_id: typeByKey['Pulso:Clima'],
			text: '¿Te sientes valorado por tu equipo?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:Clima'],
			text: '¿La comunicación interna es clara en tu área?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:Clima'],
			text: '¿Tu carga de trabajo es equilibrada?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:Clima'],
			text: '¿Sientes que tienes oportunidades de desarrollo en este rol?',
			type: 'Cerrada',
			estimated_duration: 1,
		},
		{
			question_type_id: typeByKey['Pulso:Clima'],
			text: '¿Qué temas te gustaría que se incluyeran en el próximo pulso?',
			type: 'Abierta',
			estimated_duration: 2,
		},
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
		await QuestionOption.bulkCreate(optionsData, { individualHooks: true });
	}
};
