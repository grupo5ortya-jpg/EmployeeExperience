module.exports = async function (sequelize) {
	const { Employee, Survey, SurveyAssignment, QuestionType } = sequelize.models;

	// Skip if any pulse assignment already exists
	const existing = await SurveyAssignment.findOne({
		include: [{
			model:    Survey,
			as:       'survey',
			required: true,
			include: [{
				model:    QuestionType,
				as:       'questionType',
				required: true,
				where:    { name: 'Pulso' },
			}],
		}],
	});
	if (existing) return;

	// Use the first active employee as the demo subject
	const employee = await Employee.findOne({ where: { status: 'ACTIVE' } });
	if (!employee) {
		console.warn('seeds.pulse_demo: no active employee found, skipping.');
		return;
	}

	// Resolve the three Pulso question types
	const pulsoTypes = await QuestionType.findAll({
		where: { name: 'Pulso', sub_type: ['30', '60', '90'] },
	});
	if (pulsoTypes.length === 0) {
		console.warn('seeds.pulse_demo: Pulso question types not found, skipping.');
		return;
	}

	// Create one Survey per Pulso type and assign it to the demo employee
	for (const qt of pulsoTypes) {
		const survey = await Survey.create({
			name:             `Pulso ${qt.sub_type} días`,
			question_type_id: qt.id,
			description:      `Encuesta de seguimiento a los ${qt.sub_type} días de tu ingreso.`,
		});

		await SurveyAssignment.create({
			survey_id:   survey.id,
			employee_id: employee.id,
			assigned_by: employee.id,
			status:      'PENDING',
		});
	}

	console.log(`seeds.pulse_demo: 3 pulse surveys created for employee ${employee.id}`);
};
