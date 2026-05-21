
module.exports = async function (sequelize) {
	const { QuestionType } = sequelize.models;

	const count = await QuestionType.count();
	if (count > 0) {
		return;
	}

	const questionTypes = [
		{ name: 'Onboarding', sub_type: 'Bienvenida' },
		{ name: 'Desempeño', sub_type: 'Feedback 360' },
		{ name: 'Pulso', sub_type: 'Clima' },
		{ name: 'Pulso', sub_type: '30' },
		{ name: 'Pulso', sub_type: '60' },
		{ name: 'Pulso', sub_type: '90' },
		{ name: 'Offboarding', sub_type: 'Salida' },
		{ name: 'Alumni', sub_type: 'Reencuentro' },
	];

	await QuestionType.bulkCreate(questionTypes);
};
