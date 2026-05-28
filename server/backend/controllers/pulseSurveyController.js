const { Op } = require('sequelize');
const { SurveyAssignment, Survey, QuestionType, Question, QuestionOption } = require('../connection/sequelize');

const getPendingPulseSurveys = async (req, res, next) => {
	try {
		const { employeeId } = req.query;
		if (!employeeId) {
			return res.status(400).json({ error: "'employeeId' es requerido." });
		}

		const assignments = await SurveyAssignment.findAll({
			where: {
				employee_id: employeeId,
				status: 'PENDING',
			},
			include: [{
				model:    Survey,
				as:       'survey',
				required: true,
				include: [{
					model:    QuestionType,
					as:       'questionType',
					required: true,
					where: {
						name:     'Pulso',
						sub_type: { [Op.in]: ['30', '60', '90'] },
					},
					include: [{
						model:      Question,
						as:         'questions',
						attributes: ['id', 'text', 'type', 'estimated_duration'],
						include: [{
							model:      QuestionOption,
							as:         'options',
							attributes: ['id', 'label', 'value', 'order'],
						}],
					}],
				}],
			}],
		});

		const result = assignments.map((a) => ({
			surveyId:   a.survey_id,
			employeeId: a.employee_id,
			assignedBy: a.assigned_by ?? null,
			dueDate:    a.due_date    ?? null,
			status:     a.status,
			survey: {
				id:          a.survey.id,
				name:        a.survey.name,
				description: a.survey.description ?? null,
				subType:     a.survey.questionType.sub_type,
				questions: (a.survey.questionType.questions ?? [])
					.map((q) => ({
						id:                q.id,
						text:              q.text,
						type:              q.type,
						estimatedDuration: q.estimated_duration ?? null,
						options: (q.options ?? [])
							.slice()
							.sort((a, b) => a.order - b.order)
							.map((o) => ({ id: o.id, label: o.label, value: o.value, order: o.order })),
					})),
			},
		}));

		res.json(result);
	} catch (err) {
		next(err);
	}
};

module.exports = { getPendingPulseSurveys };
