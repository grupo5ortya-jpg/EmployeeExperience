const { FeedbackAssignment, FeedbackGapAnalysis, Employee, Person, Department, Survey, QuestionType, Question, Alert } = require('../connection/sequelize');
const { generateAssignmentsForCycle } = require('../connection/feedbackAssignmentService');
const { analyzeGapAnalysis }          = require('../connection/geminiService');
const { getIdealProfile }             = require('../connection/gapAnalysisConfig');

async function attachEmployees(assignments) {
	if (assignments.length === 0) return [];

	const employeeIds = [...new Set([
		...assignments.map((a) => a.evaluator_id),
		...assignments.map((a) => a.evaluated_id),
	])];
	const cycleIds = [...new Set(assignments.map((a) => a.cycle_id))];

	const [employees, cycles] = await Promise.all([
		Employee.findAll({
			where:      { id: employeeIds },
			attributes: ['id', 'position'],
			include:    [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
		}),
		Survey.findAll({ where: { id: cycleIds }, attributes: ['id', 'name'] }),
	]);

	const empMap   = Object.fromEntries(employees.map((e) => [e.id, e]));
	const cycleMap = Object.fromEntries(cycles.map((c) => [c.id, c]));

	const fmtEmp = (id) => {
		const e = empMap[id];
		if (!e) return null;
		return {
			id:        e.id,
			position:  e.position ?? null,
			firstName: e.person?.first_name ?? null,
			lastName:  e.person?.last_name  ?? null,
		};
	};

	return assignments.map((a) => ({
		id:        a.id,
		cycleId:   a.cycle_id,
		type:      a.type,
		status:    a.status,
		createdAt: a.createdAt,
		evaluator: fmtEmp(a.evaluator_id),
		evaluated: fmtEmp(a.evaluated_id),
		cycle:     cycleMap[a.cycle_id]
			? { id: cycleMap[a.cycle_id].id, name: cycleMap[a.cycle_id].name }
			: null,
	}));
}

// GET /feedback-assignment?cycleId=xxx | ?evaluatorId=xxx | ?status=xxx
const getAssignments = async (req, res, next) => {
	try {
		const where = {};
		if (req.query.cycleId)     where.cycle_id     = req.query.cycleId;
		if (req.query.evaluatorId) where.evaluator_id = req.query.evaluatorId;
		if (req.query.status)      where.status       = req.query.status;

		const assignments = await FeedbackAssignment.findAll({
			where,
			order: [['createdAt', 'ASC']],
		});

		res.json(await attachEmployees(assignments));
	} catch (err) {
		console.error('[feedbackAssignment] getAssignments:', err.message);
		next(err);
	}
};

// POST /feedback-assignment/generate  { cycleId }
const generateAssignments = async (req, res, next) => {
	try {
		const { cycleId } = req.body;
		if (!cycleId) return res.status(400).json({ error: 'cycleId is required' });

		const cycle = await Survey.findByPk(cycleId);
		if (!cycle)              return res.status(404).json({ error: 'Cycle not found' });
		if (!cycle.department_id) return res.status(400).json({ error: 'Cycle has no department' });

		const result = await generateAssignmentsForCycle(cycleId, cycle.department_id);
		res.json(result);
	} catch (err) {
		console.error('[feedbackAssignment] generateAssignments:', err.message);
		next(err);
	}
};

// PATCH /feedback-assignment/:id  { status: 'COMPLETED' }
const updateAssignment = async (req, res, next) => {
	try {
		const assignment = await FeedbackAssignment.findByPk(req.params.id);
		if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

		const updates = {};
		if (req.body.status)   updates.status   = req.body.status;
		if (req.body.comments) updates.comments = req.body.comments;
		if (req.body.scores)   updates.scores   = req.body.scores;
		if (Object.keys(updates).length) await assignment.update(updates);

		const updated = await FeedbackAssignment.findByPk(assignment.id);
		const [formatted] = await attachEmployees([updated]);
		res.json(formatted);

		// Fire-and-forget: check if all evaluations for this employee in this cycle are done
		if (updates.status === 'COMPLETED') {
			notifyIfCycleComplete(updated.cycle_id, updated.evaluated_id).catch(console.error);
		}
	} catch (err) {
		console.error('[feedbackAssignment] updateAssignment:', err.message);
		next(err);
	}
};

async function notifyIfCycleComplete(cycleId, evaluatedId) {
	const all = await FeedbackAssignment.findAll({
		where: { cycle_id: cycleId, evaluated_id: evaluatedId },
	});

	if (!all.length || !all.every(a => a.status === 'COMPLETED')) return;

	// Avoid duplicate alerts
	const existing = await Alert.findOne({
		where: { employee_id: evaluatedId, type: 'FEEDBACK_CYCLE_COMPLETED' },
	});
	if (existing) return;

	// Fetch evaluated employee name for the message
	const emp = await Employee.findByPk(evaluatedId, {
		include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
	});
	const name = emp
		? `${emp.person?.first_name ?? ''} ${emp.person?.last_name ?? ''}`.trim()
		: 'El empleado';

	// Alert for HR — topics[0] stores cycleId so the frontend can link directly to HR report
	await Alert.create({
		employee_id: evaluatedId,
		type:        'FEEDBACK_CYCLE_COMPLETED',
		message:     `Todas las evaluaciones de Feedback 360° de ${name} fueron completadas. Ya podés ver el informe y generar el análisis de brechas.`,
		topics:      [cycleId],
		status:      'UNREAD',
	});

	// Alert for the employee — topics[0] stores cycleId so the frontend can link directly to the report
	await Alert.create({
		employee_id: evaluatedId,
		type:        'FEEDBACK_EVALUATION_READY',
		message:     'Tu evaluación de Feedback 360° está completa. Ya podés ver tus resultados y análisis de desarrollo.',
		topics:      [cycleId],
		status:      'UNREAD',
	});
}

// GET /feedback-assignment/results?cycleId=xxx&evaluatedId=xxx
const getResults = async (req, res, next) => {
	try {
		const { cycleId, evaluatedId } = req.query;
		if (!cycleId || !evaluatedId)
			return res.status(400).json({ error: 'cycleId and evaluatedId are required' });

		// 1. Fetch cycle to get selected competency IDs
		const cycle = await Survey.findByPk(cycleId, {
			attributes: ['id', 'name', 'competencies', 'min_anonymous_responses'],
		});
		if (!cycle) return res.status(404).json({ error: 'Cycle not found' });
		const competencyIds = cycle.competencies ?? [];

		// 2. Fetch Feedback360 questions grouped by competency
		const questionTypes = await QuestionType.findAll({
			where: { name: 'Feedback360', sub_type: competencyIds },
			include: [{ model: Question, as: 'questions', attributes: ['id', 'text'] }],
		});

		// Build lookup: questionId → competencyId
		const qToComp = {};
		for (const qt of questionTypes) {
			for (const q of qt.questions ?? []) qToComp[q.id] = qt.sub_type;
		}

		// 3. Fetch ALL assignments for the evaluated employee to show pending count
		const allAssignments = await FeedbackAssignment.findAll({
			where: { cycle_id: cycleId, evaluated_id: evaluatedId },
		});
		const assignments = allAssignments.filter(a => a.status === 'COMPLETED');
		const pendingCount = allAssignments.filter(a => a.status === 'PENDING').length;

		// Batch-fetch all employee info to avoid Sequelize double-join bug
		const allEmployeeIds = [...new Set([
			evaluatedId,
			...assignments.map(a => a.evaluator_id),
		])];
		const employeeRows = await Employee.findAll({
			where:      { id: allEmployeeIds },
			attributes: ['id', 'position'],
			include:    [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
		});
		const empMap = Object.fromEntries(employeeRows.map(e => [e.id, e]));
		const fmtEmp = (id) => {
			const e = empMap[id];
			if (!e) return null;
			return {
				id:        e.id,
				position:  e.position ?? null,
				firstName: e.person?.first_name ?? null,
				lastName:  e.person?.last_name  ?? null,
			};
		};

		// 4. Aggregate scores and comments per competency
		const scoresByComp  = {}; // { compId: number[] }
		const commentsByComp = {}; // { compId: string[] }

		for (const a of assignments) {
			for (const [qId, score] of Object.entries(a.scores ?? {})) {
				const compId = qToComp[qId];
				if (!compId) continue;
				(scoresByComp[compId] = scoresByComp[compId] ?? []).push(Number(score));
			}
			for (const [compId, text] of Object.entries(a.comments ?? {})) {
				if (!text?.trim()) continue;
				(commentsByComp[compId] = commentsByComp[compId] ?? []).push(text.trim());
			}
		}

		const avg = (arr) => arr.length
			? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
			: null;

		const competencies = competencyIds.map((compId) => ({
			id:       compId,
			average:  avg(scoresByComp[compId] ?? []),
			comments: commentsByComp[compId] ?? [],
		}));

		// 5. Full breakdown per evaluator (for HR view)
		const breakdown = assignments.map((a) => {
			const byComp = {};
			for (const [qId, score] of Object.entries(a.scores ?? {})) {
				const compId = qToComp[qId];
				if (!compId) continue;
				(byComp[compId] = byComp[compId] ?? []).push(Number(score));
			}
			const compScores = {};
			for (const [compId, scores] of Object.entries(byComp))
				compScores[compId] = avg(scores);

			return {
				id:        a.id,
				type:      a.type,
				evaluator: fmtEmp(a.evaluator_id),
				scores:    compScores,
				comments:  a.comments ?? {},
			};
		});

		const minRequired = cycle.min_anonymous_responses ?? 0;
		const isBlocked   = minRequired > 0 && assignments.length < minRequired;

		res.json({
			cycle:        { id: cycle.id, name: cycle.name },
			evaluated:    fmtEmp(evaluatedId),
			competencies,
			breakdown,
			stats: {
				completed:   assignments.length,
				pending:     pendingCount,
				total:       allAssignments.length,
				minRequired,
				blocked:     isBlocked,
			},
		});
	} catch (err) {
		console.error('[feedbackAssignment] getResults:', err.message);
		next(err);
	}
};

// GET /feedback-assignment/gap-analysis?cycleId=xxx&evaluatedId=xxx
const getGapAnalysis = async (req, res, next) => {
	try {
		const { cycleId, evaluatedId } = req.query;
		if (!cycleId || !evaluatedId)
			return res.status(400).json({ error: 'cycleId and evaluatedId are required' });

		const existing = await FeedbackGapAnalysis.findOne({
			where: { cycle_id: cycleId, employee_id: evaluatedId },
		});

		if (!existing) return res.json(null);

		res.json({
			department:      existing.department,
			actualResults:   existing.actual_results,
			expectedResults: existing.expected_results,
			analysis: {
				strengths:   existing.strengths,
				gaps:        existing.gaps,
				suggestions: existing.suggestions,
				summary:     existing.summary,
			},
			createdAt: existing.createdAt,
		});
	} catch (err) {
		console.error('[feedbackAssignment] getGapAnalysis:', err.message);
		next(err);
	}
};

// POST /feedback-assignment/gap-analysis  { cycleId, evaluatedId }
const generateGapAnalysis = async (req, res, next) => {
	try {
		const { cycleId, evaluatedId } = req.body;
		if (!cycleId || !evaluatedId)
			return res.status(400).json({ error: 'cycleId and evaluatedId are required' });

		// 1. Get cycle competencies
		const cycle = await Survey.findByPk(cycleId, { attributes: ['id', 'competencies'] });
		if (!cycle) return res.status(404).json({ error: 'Cycle not found' });

		// 2. Get evaluated employee + department name
		const evaluated = await Employee.findByPk(evaluatedId, {
			attributes: ['id', 'position'],
			include: [
				{ model: Person,     as: 'person',     attributes: ['first_name', 'last_name'] },
				{ model: Department, as: 'department',  attributes: ['name'] },
			],
		});
		if (!evaluated) return res.status(404).json({ error: 'Employee not found' });

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

		if (assignments.length === 0)
			return res.status(400).json({ error: 'No completed evaluations found for this employee.' });

		// Return cached analysis if already generated
		const cached = await FeedbackGapAnalysis.findOne({
			where: { cycle_id: cycleId, employee_id: evaluatedId },
		});
		if (cached) {
			return res.json({
				department:      cached.department,
				actualResults:   cached.actual_results,
				expectedResults: cached.expected_results,
				analysis: {
					strengths:   cached.strengths,
					gaps:        cached.gaps,
					suggestions: cached.suggestions,
					summary:     cached.summary,
				},
				createdAt: cached.createdAt,
				cached: true,
			});
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

		res.json({
			employeeName,
			department:      departmentName,
			actualResults,
			expectedResults: filteredExpected,
			analysis,
			cached: false,
		});
	} catch (err) {
		console.error('[feedbackAssignment] generateGapAnalysis:', err.message);
		next(err);
	}
};

module.exports = { getAssignments, generateAssignments, updateAssignment, getResults, getGapAnalysis, generateGapAnalysis };
