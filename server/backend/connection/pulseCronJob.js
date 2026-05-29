const cron        = require('node-cron');
const { Op }      = require('sequelize');
const { Employee, Survey, SurveyAssignment, QuestionType, Alert } = require('./sequelize');

const PULSE_DAYS = [30, 60, 90];

async function assignDuePulseSurveys() {
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	const todayEnd = new Date(todayStart);
	todayEnd.setDate(todayEnd.getDate() + 1);

	for (const days of PULSE_DAYS) {
		// Target hire date: employees hired exactly `days` ago
		const targetStart = new Date(todayStart);
		targetStart.setDate(targetStart.getDate() - days);
		const targetEnd = new Date(targetStart);
		targetEnd.setDate(targetEnd.getDate() + 1);

		const employees = await Employee.findAll({
			where: {
				hire_date: { [Op.gte]: targetStart, [Op.lt]: targetEnd },
				status:    'ACTIVE',
			},
		});

		if (employees.length === 0) continue;

		const qt = await QuestionType.findOne({
			where: { name: 'Pulso', sub_type: String(days) },
		});
		if (!qt) {
			console.warn(`pulseCron: QuestionType Pulso/${days} not found, skipping.`);
			continue;
		}

		for (const employee of employees) {
			// Skip if this employee already has an assignment for this pulse type
			const existing = await SurveyAssignment.findOne({
				where: { employee_id: employee.id },
				include: [{
					model:    Survey,
					as:       'survey',
					required: true,
					where:    { question_type_id: qt.id },
				}],
			});
			if (existing) continue;

			const survey = await Survey.create({
				name:             `Pulso ${days} días`,
				question_type_id: qt.id,
				description:      `Encuesta de seguimiento a los ${days} días de tu ingreso.`,
			});

			await SurveyAssignment.create({
				survey_id:   survey.id,
				employee_id: employee.id,
				assigned_by: employee.id,
				status:      'PENDING',
			});

			// Employee-facing alert — in the future this will be filtered by role
			await Alert.create({
				employee_id: employee.id,
				type:        'PULSE_SURVEY_DUE',
				message:     `Tenés una encuesta de pulso pendiente: Pulso ${days} días. ¡Completala cuando puedas!`,
				status:      'UNREAD',
			});

			console.log(`pulseCron: Pulso ${days} assigned to employee ${employee.id}`);
		}
	}
}

function startPulseCronJob() {
	// Runs every day at 9:00 AM
	cron.schedule('0 9 * * *', async () => {
		console.log('pulseCron: checking employees due for pulse surveys...');
		try {
			await assignDuePulseSurveys();
		} catch (err) {
			console.error('pulseCron: error during execution:', err);
		}
	});

	console.log('pulseCron: scheduled (daily at 09:00)');
}

module.exports = { startPulseCronJob, assignDuePulseSurveys };
