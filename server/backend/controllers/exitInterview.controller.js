const { Op } = require('sequelize');
const {
	SurveyAssignment, Survey, QuestionType, Question, QuestionOption, SurveyResponse,
	EmployeeTask, Task, Employee, Person, Alert,
} = require('../connection/sequelize');
const { SURVEY_ASSIGNMENT, EMPLOYEE_TASK } = require('../utils/constants/models.constants.js');
const { getOffboardingChecklistTaskType, getExitInterviewQuestionType } = require('../utils/offboarding.js');

const EXIT_INTERVIEW_TASK_NAME = 'Entrevista de salida con RRHH';

// GET /exit-interviews/pending?employeeId=X — mirror de pulseSurveyController.getPendingPulseSurveys,
// pero filtrando por la SurveyAssignment de la entrevista de salida (QuestionType "Offboarding"/"Salida")
// y respetando la ventana de 30 días (due_date >= hoy).
const getPendingExitInterviews = async (req, res, next) => {
	try {
		const { employeeId } = req.query;
		if (!employeeId) {
			return res.status(400).json({ error: "'employeeId' es requerido." });
		}

		const exitInterviewQuestionType = await getExitInterviewQuestionType();

		const assignments = await SurveyAssignment.findAll({
			where: {
				employee_id: employeeId,
				status:      SURVEY_ASSIGNMENT.STATUS_PENDING,
				due_date:    { [Op.gte]: new Date() },
			},
			include: [{
				model:    Survey,
				as:       'survey',
				required: true,
				where:    { question_type_id: exitInterviewQuestionType.id },
				include: [{
					model:    QuestionType,
					as:       'questionType',
					required: true,
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
			dueDate:    a.due_date ?? null,
			status:     a.status,
			survey: {
				id:          a.survey.id,
				name:        a.survey.name,
				description: a.survey.description ?? null,
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

// POST /exit-interviews/:surveyId/submit {employeeId, responses: [{questionId, questionOptionId, numericValue, answerText}]}
const submitExitInterview = async (req, res, next) => {
	try {
		const { surveyId } = req.params;
		const { employeeId, responses } = req.body;

		if (!employeeId || !Array.isArray(responses) || responses.length === 0) {
			return res.status(400).json({ status: 'fail', message: 'employeeId y responses son requeridos' });
		}

		const assignment = await SurveyAssignment.findOne({
			where: { survey_id: surveyId, employee_id: employeeId },
		});
		if (!assignment) return res.status(404).json({ status: 'fail', message: 'Exit interview not found' });
		if (assignment.status !== SURVEY_ASSIGNMENT.STATUS_PENDING) {
			return res.status(400).json({ status: 'fail', message: 'La entrevista de salida ya fue completada' });
		}
		if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
			return res.status(400).json({ status: 'fail', message: 'La ventana para completar la entrevista de salida ya venció' });
		}

		await SurveyResponse.bulkCreate(
			responses.map((r) => ({
				survey_assignment_id: assignment.survey_id,
				question_id:          r.questionId,
				answer_text:          r.answerText       ?? null,
				question_option_id:   r.questionOptionId ?? null,
				numeric_value:        r.numericValue     ?? null,
			})),
			{ ignoreDuplicates: true }
		);

		await assignment.update({ status: SURVEY_ASSIGNMENT.STATUS_COMPLETED });

		// Auto-completa la tarea "Entrevista de salida con RRHH" del checklist de offboarding, si existe
		const checklistTaskType = await getOffboardingChecklistTaskType();
		const exitInterviewTask = await Task.findOne({
			where: { task_type_id: checklistTaskType.id, name: EXIT_INTERVIEW_TASK_NAME },
		});
		if (exitInterviewTask) {
			await EmployeeTask.update(
				{ status: EMPLOYEE_TASK.STATUS_COMPLETED },
				{ where: { employee_id: employeeId, task_id: exitInterviewTask.id } },
			);
		}

		const employee = await Employee.findByPk(employeeId, {
			include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
		});
		const name = employee
			? `${employee.person?.first_name ?? ''} ${employee.person?.last_name ?? ''}`.trim()
			: 'Un empleado';

		Alert.create({
			employee_id: employeeId,
			type:        'EXIT_INTERVIEW_COMPLETED',
			message:     `${name} completó su entrevista de salida.`,
			status:      'UNREAD',
		}).catch(console.error);

		res.json({ status: 'ok', surveyId: assignment.survey_id, employeeId, surveyAssignmentStatus: assignment.status });
	} catch (err) {
		next(err);
	}
};

module.exports = { getPendingExitInterviews, submitExitInterview };
