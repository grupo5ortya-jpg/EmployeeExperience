const { SurveyResponse, SurveyAssignment, Question, QuestionOption } = require('../connection/sequelize');
const { SURVEY_ASSIGNMENT } = require('../utils/constants/models.constants.js');

const RESPONSE_INCLUDE = [
	{ model: Question,       as: 'question',       attributes: ['id', 'text', 'type'] },
	{ model: QuestionOption, as: 'selectedOption',  attributes: ['id', 'label', 'value'] },
];

function formatResponse(r) {
	return {
		surveyAssignmentId: r.survey_assignment_id,
		questionId:         r.question_id,
		answerText:         r.answer_text      ?? null,
		numericValue:       r.numeric_value    ?? null,
		createdAt:          r.createdAt,
		updatedAt:          r.updatedAt,
		question:           r.question         ?? null,
		selectedOption:     r.selectedOption   ?? null,
	};
}

const getAllResponses = async (req, res, next) => {
	try {
		const responses = await SurveyResponse.findAll({ include: RESPONSE_INCLUDE });
		res.json(responses.map(formatResponse));
	} catch (err) {
		next(err);
	}
};

const getResponseById = async (req, res, next) => {
	try {
		const { surveyAssignmentId, questionId } = req.params;
		const response = await SurveyResponse.findOne({
			where:   { survey_assignment_id: surveyAssignmentId, question_id: questionId },
			include: RESPONSE_INCLUDE,
		});
		if (!response) return res.status(404).json({ status: 'fail', message: 'Survey response not found' });
		res.json(formatResponse(response));
	} catch (err) {
		next(err);
	}
};

const createResponse = async (req, res, next) => {
	try {
		const { surveyAssignmentId, questionId, answerText, questionOptionId, numericValue } = req.body;

		// `survey_assignment_id` no es realmente la PK compuesta de SurveyAssignment — el flujo de
		// Pulso (único caller real de este endpoint) lo usa como alias de `Survey.id` (ver
		// PulseSurveyForm.jsx#submitPulseResponse). Cada empleado tiene su propio Survey por
		// check-in (pulseCronJob.js nunca reusa uno entre empleados), así que esto sigue
		// identificando una asignación puntual sin ambigüedad. Ownership check: mismo patrón que
		// pulseSurveyService.js#handleCompletePulseSurvey (que ya hace este lookup antes de leer
		// las respuestas) — Talento bypassa, el resto solo puede responder su propia asignación
		// PENDING. EXP-DEV-20-FIX-01, ver jira-documentation.md.
		if (req.user?.role !== 'Talento') {
			const assignment = await SurveyAssignment.findOne({
				where: {
					survey_id:   surveyAssignmentId,
					employee_id: req.user?.employeeId,
					status:      SURVEY_ASSIGNMENT.STATUS_PENDING,
				},
			});
			if (!assignment) {
				return res.status(403).json({ status: 'fail', message: 'No podés responder una encuesta que no es tuya o que ya fue completada.' });
			}
		}

		const response = await SurveyResponse.create({
			survey_assignment_id: surveyAssignmentId,
			question_id:          questionId,
			answer_text:          answerText       || null,
			question_option_id:   questionOptionId || null,
			numeric_value:        numericValue     ?? null,
		});
		const full = await SurveyResponse.findOne({
			where:   { survey_assignment_id: response.survey_assignment_id, question_id: response.question_id },
			include: RESPONSE_INCLUDE,
		});

		res.status(201).json(formatResponse(full));
	} catch (err) {
		next(err);
	}
};

const updateResponse = async (req, res, next) => {
	try {
		const { surveyAssignmentId, questionId } = req.params;
		const response = await SurveyResponse.findOne({
			where: { survey_assignment_id: surveyAssignmentId, question_id: questionId },
		});
		if (!response) return res.status(404).json({ status: 'fail', message: 'Survey response not found' });

		const { answerText, questionOptionId, numericValue } = req.body;
		const updates = {};
		if (answerText       !== undefined) updates.answer_text        = answerText       || null;
		if (questionOptionId !== undefined) updates.question_option_id = questionOptionId || null;
		if (numericValue     !== undefined) updates.numeric_value      = numericValue     ?? null;

		await response.update(updates);
		const updated = await SurveyResponse.findOne({
			where:   { survey_assignment_id: surveyAssignmentId, question_id: questionId },
			include: RESPONSE_INCLUDE,
		});
		res.json(formatResponse(updated));
	} catch (err) {
		next(err);
	}
};

const deleteResponse = async (req, res, next) => {
	try {
		const { surveyAssignmentId, questionId } = req.params;
		const response = await SurveyResponse.findOne({
			where: { survey_assignment_id: surveyAssignmentId, question_id: questionId },
		});
		if (!response) return res.status(404).json({ status: 'fail', message: 'Survey response not found' });
		await response.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllResponses,
	getResponseById,
	createResponse,
	updateResponse,
	deleteResponse,
};
