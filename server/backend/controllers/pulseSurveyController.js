const { Op } = require('sequelize');
const { SurveyAssignment, Survey, QuestionType, Question, QuestionOption, PulseAnalysis, Employee, Person } = require('../connection/sequelize');

const SURVEY_LEVEL_QID = '00000000-0000-0000-0000-000000000000';

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

const getPulseAnalyses = async (req, res, next) => {
	try {
		const analyses = await PulseAnalysis.findAll({
			where: { question_id: SURVEY_LEVEL_QID },
			include: [{
				model:    SurveyAssignment,
				as:       'surveyAssignment',
				include:  [
					{
						model:    Survey,
						as:       'survey',
						attributes: ['id', 'name'],
						include: [{
							model:      QuestionType,
							as:         'questionType',
							attributes: ['sub_type'],
						}],
					},
					{
						model:      Employee,
						as:         'employee',
						attributes: ['id', 'position'],
						include: [{
							model:      Person,
							as:         'person',
							attributes: ['first_name', 'last_name'],
						}],
					},
				],
			}],
			order: [['createdAt', 'DESC']],
		});

		res.json(analyses.map((a) => {
			const sa = a.surveyAssignment;
			return {
				surveyAssignmentId: a.survey_assignment_id,
				overallRisk:        a.overall_risk  ?? null,
				sentiment:          a.sentiment,
				topics:             a.topics        ?? [],
				summary:            a.summary       ?? null,
				reasoning:          a.reasoning     ?? null,
				scoresSnapshot:     a.scores_snapshot ?? [],
				createdAt:          a.createdAt,
				survey: sa?.survey
					? {
						id:      sa.survey.id,
						name:    sa.survey.name,
						subType: sa.survey.questionType?.sub_type ?? null,
					}
					: null,
				employee: sa?.employee
					? {
						id:        sa.employee.id,
						position:  sa.employee.position  ?? null,
						firstName: sa.employee.person?.first_name ?? null,
						lastName:  sa.employee.person?.last_name  ?? null,
					}
					: null,
			};
		}));
	} catch (err) {
		next(err);
	}
};

module.exports = { getPendingPulseSurveys, getPulseAnalyses };
