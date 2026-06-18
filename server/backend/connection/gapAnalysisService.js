const { FeedbackAssignment, FeedbackGapAnalysis, Employee, Person, Department, Survey, QuestionType, Question } = require('./sequelize');
const { analyzeGapAnalysis } = require('./geminiService');
const { getIdealProfile }    = require('./gapAnalysisConfig');

/**
 * Computes the Feedback 360 gap analysis for an employee in a cycle: aggregates
 * completed-assignment scores per source (self/peer/leader/direct report), calls
 * Gemini for the qualitative analysis, and persists the result. Returns the
 * cached analysis instead if one already exists for this cycle+employee.
 *
 * @returns {Promise<
 *   { error: 'CYCLE_NOT_FOUND' | 'EMPLOYEE_NOT_FOUND' | 'NO_COMPLETED_EVALUATIONS' } |
 *   { data: object }
 * >}
 */
async function generateGapAnalysisForEmployee(cycleId, evaluatedId) {
	// 1. Get cycle competencies
	const cycle = await Survey.findByPk(cycleId, { attributes: ['id', 'competencies'] });
	if (!cycle) return { error: 'CYCLE_NOT_FOUND' };

	// 2. Get evaluated employee + department name
	const evaluated = await Employee.findByPk(evaluatedId, {
		attributes: ['id', 'position'],
		include: [
			{ model: Person,     as: 'person',     attributes: ['first_name', 'last_name'] },
			{ model: Department, as: 'department',  attributes: ['name'] },
		],
	});
	if (!evaluated) return { error: 'EMPLOYEE_NOT_FOUND' };

	// 3. Get completed assignments and aggregate scores per competency
	const questionTypes = await QuestionType.findAll({
		where: { name: 'Feedback360', sub_type: cycle.competencies ?? [] },
		include: [{ model: Question, as: 'questions', attributes: ['id'] }],
	});
	const qToComp = {};
	for (const qt of questionTypes)
		for (const q of qt.questions ?? []) qToComp[q.id] = qt.sub_type;

	const assignments = await FeedbackAssignment.findAll({
		where: { cycle_id: cycleId, evaluated_id: evaluatedId, status: 'COMPLETED' },
	});

	if (assignments.length === 0) return { error: 'NO_COMPLETED_EVALUATIONS' };

	// Return cached analysis if already generated
	const cached = await FeedbackGapAnalysis.findOne({
		where: { cycle_id: cycleId, employee_id: evaluatedId },
	});
	if (cached) {
		return {
			data: {
				id:              cached.id,
				department:      cached.department,
				actualResults:   cached.actual_results,
				expectedResults: cached.expected_results,
				analysis: {
					strengths:   cached.strengths,
					gaps:        cached.gaps,
					suggestions: cached.suggestions,
					summary:     cached.summary,
				},
				sentSections: cached.sent_sections,
				sentAt:       cached.sent_at,
				createdAt:    cached.createdAt,
				cached:       true,
			},
		};
	}

	const selfScores         = {};
	const peerScores         = {};
	const leaderScores       = {};
	const directReportScores = {};
	const commentsByComp     = {};

	const scoreTarget = (type) => {
		if (type === 'SELF')          return selfScores;
		if (type === 'PEER')          return peerScores;
		if (type === 'LEADER')        return leaderScores;
		if (type === 'DIRECT_REPORT') return directReportScores;
		return peerScores;
	};

	for (const a of assignments) {
		const target = scoreTarget(a.type);
		for (const [qId, score] of Object.entries(a.scores ?? {})) {
			const compId = qToComp[qId];
			if (!compId) continue;
			(target[compId] = target[compId] ?? []).push(Number(score));
		}
		for (const [compId, text] of Object.entries(a.comments ?? {})) {
			if (!text?.trim()) continue;
			(commentsByComp[compId] = commentsByComp[compId] ?? []).push(text.trim());
		}
	}

	const avg = (arr) => arr?.length
		? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
		: null;

	// Build per-source averages
	const toAvg = (map) => Object.fromEntries(
		Object.entries(map).map(([k, v]) => [k, avg(v)])
	);

	const selfResults         = toAvg(selfScores);
	const peerResults         = toAvg(peerScores);
	const leaderResults       = toAvg(leaderScores);
	const directReportResults = toAvg(directReportScores);

	// Overall actual = weighted avg of all scores combined
	const allScores = {};
	for (const [compId, s] of Object.entries(selfScores))
		allScores[compId] = [...(allScores[compId] ?? []), ...s];
	for (const [compId, p] of Object.entries(peerScores))
		allScores[compId] = [...(allScores[compId] ?? []), ...p];

	const actualResults = {};
	for (const [compId, scores] of Object.entries(allScores))
		actualResults[compId] = avg(scores);

	// 4. Load ideal profile for the department
	const departmentName  = evaluated.department?.name ?? '';
	const expectedResults = getIdealProfile(departmentName);

	// Filter expected to only evaluated competencies
	const filteredExpected = Object.fromEntries(
		Object.entries(expectedResults).filter(([k]) => actualResults[k] != null),
	);

	// 5. Call Gemini with scores + written comments
	const employeeName = `${evaluated.person?.first_name ?? ''} ${evaluated.person?.last_name ?? ''}`.trim();
	const analysis = await analyzeGapAnalysis({
		employeeName,
		department:          departmentName || 'General',
		selfResults,
		peerResults,
		leaderResults,
		directReportResults,
		actualResults,
		expectedResults:     filteredExpected,
		commentsByComp,
	});

	// Persist the analysis
	await FeedbackGapAnalysis.create({
		employee_id:      evaluatedId,
		cycle_id:         cycleId,
		department:       departmentName,
		strengths:        analysis.strengths   ?? [],
		gaps:             analysis.gaps        ?? [],
		suggestions:      analysis.suggestions ?? [],
		summary:          analysis.summary     ?? '',
		actual_results:   actualResults,
		expected_results: filteredExpected,
	});

	const created = await FeedbackGapAnalysis.findOne({
		where: { cycle_id: cycleId, employee_id: evaluatedId },
	});

	return {
		data: {
			id:              created?.id,
			employeeName,
			department:      departmentName,
			actualResults,
			expectedResults: filteredExpected,
			analysis,
			sentSections:    null,
			sentAt:          null,
			cached:          false,
		},
	};
}

module.exports = { generateGapAnalysisForEmployee };
