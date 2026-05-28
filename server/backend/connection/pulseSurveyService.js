const { Question, QuestionType, SurveyAssignment, PulseAnalysis } = require('./sequelize');
const { analyzePulseResponse } = require('./geminiService');
const { createPulseAlert }     = require('./alertService');

const PULSE_SUBTYPES = new Set(['30', '60', '90']);

/**
 * After an open-text pulse response is saved, runs AI analysis and creates
 * an alert if a negative onboarding signal is detected.
 *
 * Intended to be called fire-and-forget (no await at call site).
 *
 * @param {string} surveyAssignmentId - survey_id from SurveyAssignment
 * @param {string} questionId
 * @param {string} answerText
 */
async function handleOpenPulseResponse(surveyAssignmentId, questionId, answerText) {
	if (!answerText?.trim()) return;

	// 1. Verify the question is open-ended and belongs to a Pulso survey type
	const question = await Question.findByPk(questionId, {
		include: [{ model: QuestionType, as: 'questionType', attributes: ['name', 'sub_type'] }],
	});

	if (!question || question.type !== 'Abierta') return;
	if (question.questionType?.name !== 'Pulso') return;
	if (!PULSE_SUBTYPES.has(question.questionType?.sub_type)) return;

	// 2. Resolve the employee from the assignment
	const assignment = await SurveyAssignment.findOne({
		where: { survey_id: surveyAssignmentId },
	});
	if (!assignment?.employee_id) return;

	// 3. Run AI analysis
	const analysis = await analyzePulseResponse(answerText);

	// 4. Persist the analysis (upsert in case the response was edited)
	await PulseAnalysis.upsert({
		survey_assignment_id: surveyAssignmentId,
		question_id:          questionId,
		sentiment:            analysis.sentiment,
		risk_level:           analysis.riskLevel,
		topics:               analysis.topics   ?? [],
		summary:              analysis.summary  ?? '',
	});

	// 5. Alert if sentiment is negative or risk is medium/high
	const needsAlert = analysis.sentiment === 'negative'
	                || analysis.riskLevel  === 'medium'
	                || analysis.riskLevel  === 'high';

	if (needsAlert) {
		await createPulseAlert({
			employeeId:   assignment.employee_id,
			pulseSubType: question.questionType.sub_type,
			riskLevel:    analysis.riskLevel,
			sentiment:    analysis.sentiment,
			topics:       analysis.topics ?? [],
			summary:      analysis.summary,
		});
	}
}

module.exports = { handleOpenPulseResponse };
