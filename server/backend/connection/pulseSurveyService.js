const { Question, QuestionType, Survey, SurveyAssignment, SurveyResponse, PulseAnalysis } = require('./sequelize');
const { analyzePulseSurvey } = require('./geminiService');
const { createPulseAlert }   = require('./alertService');

const PULSE_SUBTYPES = new Set(['30', '60', '90']);

// Sentinel UUID used as question_id for survey-level analysis records
// (avoids restructuring the composite PK; guaranteed not to match any real question)
const SURVEY_LEVEL_QID = '00000000-0000-0000-0000-000000000000';

// Maps Gemini riskLevel to Alert model's ENUM values
const RISK_MAP = { GOOD: 'low', MEDIUM: 'medium', NEGATIVE: 'high' };

/**
 * Runs the full AI onboarding-risk analysis for a completed pulse survey.
 * Collects all closed scores + open comment, calls Gemini, persists PulseAnalysis,
 * and creates an HR Alert when risk is MEDIUM or NEGATIVE.
 *
 * Intended to be called fire-and-forget (no await at call site).
 *
 * @param {string} surveyId   - survey_id from SurveyAssignment
 * @param {string} employeeId
 */
async function handleCompletePulseSurvey(surveyId, employeeId) {
	// 1. Verify this is a Pulso survey type
	const assignment = await SurveyAssignment.findOne({
		where: { survey_id: surveyId, employee_id: employeeId },
		include: [{
			model:    Survey,
			as:       'survey',
			required: true,
			include:  [{
				model:    QuestionType,
				as:       'questionType',
				required: true,
				where:    { name: 'Pulso' },
			}],
		}],
	});
	if (!assignment) return;

	const subType = assignment.survey.questionType.sub_type;
	if (!PULSE_SUBTYPES.has(subType)) return;

	// 2. Fetch all responses for this survey assignment, with question metadata
	const responses = await SurveyResponse.findAll({
		where:   { survey_assignment_id: surveyId },
		include: [{ model: Question, as: 'question', attributes: ['text', 'type'] }],
	});
	if (responses.length === 0) return;

	// 3. Separate closed scores from open comment
	const closedAnswers = [];
	let openComment = null;

	for (const r of responses) {
		if (r.question?.type === 'Cerrada' && r.numeric_value != null) {
			closedAnswers.push({ question: r.question.text, score: r.numeric_value });
		} else if (r.question?.type === 'Abierta' && r.answer_text) {
			openComment = r.answer_text;
		}
	}

	if (closedAnswers.length === 0 && !openComment) return;

	// 4. Run AI analysis with full survey context
	const analysis = await analyzePulseSurvey({
		surveyType: `${subType}_DAYS`,
		closedAnswers,
		openComment,
	});

	// 5. Persist analysis (upsert on the sentinel question_id for survey-level records)
	await PulseAnalysis.upsert({
		survey_assignment_id: surveyId,
		question_id:          SURVEY_LEVEL_QID,
		sentiment:            analysis.sentiment   ?? 'neutral',
		risk_level:           RISK_MAP[analysis.riskLevel] ?? 'low',
		overall_risk:         analysis.riskLevel   ?? 'GOOD',
		topics:               analysis.topics      ?? [],
		summary:              analysis.summary     ?? '',
		reasoning:            analysis.reasoning   ?? '',
		scores_snapshot:      closedAnswers,
	});

	// 6. Create HR alert for MEDIUM or NEGATIVE risk
	const needsAlert = analysis.riskLevel === 'NEGATIVE' || analysis.riskLevel === 'MEDIUM';
	if (needsAlert) {
		await createPulseAlert({
			employeeId,
			pulseSubType: subType,
			riskLevel:    RISK_MAP[analysis.riskLevel],
			sentiment:    analysis.sentiment,
			topics:       analysis.topics    ?? [],
			summary:      analysis.summary,
			reasoning:    analysis.reasoning,
		});
	}
}

module.exports = { handleCompletePulseSurvey };
