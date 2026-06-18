const { FeedbackAssignment, FeedbackGapAnalysis, Employee, Person, Survey, QuestionType, Question, Alert } = require('../connection/sequelize');
const { generateAssignmentsForCycle }    = require('../connection/feedbackAssignmentService');
const { generateGapAnalysisForEmployee } = require('../connection/gapAnalysisService');

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
			id:              existing.id,
			department:      existing.department,
			actualResults:   existing.actual_results,
			expectedResults: existing.expected_results,
			analysis: {
				strengths:   existing.strengths,
				gaps:        existing.gaps,
				suggestions: existing.suggestions,
				summary:     existing.summary,
			},
			sentSections: existing.sent_sections,
			sentAt:       existing.sent_at,
			createdAt:    existing.createdAt,
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

		const result = await generateGapAnalysisForEmployee(cycleId, evaluatedId);

		if (result.error === 'CYCLE_NOT_FOUND')
			return res.status(404).json({ error: 'Cycle not found' });
		if (result.error === 'EMPLOYEE_NOT_FOUND')
			return res.status(404).json({ error: 'Employee not found' });
		if (result.error === 'NO_COMPLETED_EVALUATIONS')
			return res.status(400).json({ error: 'No completed evaluations found for this employee.' });

		res.json(result.data);
	} catch (err) {
		console.error('[feedbackAssignment] generateGapAnalysis:', err.message);
		next(err);
	}
};

// PATCH /feedback-assignment/gap-analysis/send  { cycleId, evaluatedId, sections: ['strengths','gaps','suggestions'] }
const sendGapAnalysis = async (req, res, next) => {
	try {
		const { cycleId, evaluatedId, sections } = req.body;
		if (!cycleId || !evaluatedId || !Array.isArray(sections) || sections.length === 0)
			return res.status(400).json({ error: 'cycleId, evaluatedId and sections[] are required' });

		const record = await FeedbackGapAnalysis.findOne({
			where: { cycle_id: cycleId, employee_id: evaluatedId },
		});
		if (!record)
			return res.status(404).json({ error: 'Gap analysis not found. Generate it first.' });

		await record.update({ sent_sections: sections, sent_at: new Date() });

		// Alert employee — deduplicated per cycle
		const existing = await Alert.findOne({
			where: { employee_id: evaluatedId, type: 'FEEDBACK_GAP_ANALYSIS_SENT', topics: { [require('sequelize').Op.contains]: [cycleId] } },
		});
		if (!existing) {
			const emp = await Employee.findByPk(evaluatedId, {
				include: [{ model: Person, as: 'person', attributes: ['first_name'] }],
			});
			const firstName = emp?.person?.first_name ?? 'Tu';
			await Alert.create({
				employee_id: evaluatedId,
				type:        'FEEDBACK_GAP_ANALYSIS_SENT',
				message:     `${firstName}, RRHH compartió tu análisis de desarrollo del ciclo de Feedback 360°. ¡Revisá tus resultados!`,
				status:      'UNREAD',
				topics:      [cycleId],
			});
		}

		res.json({
			id:           record.id,
			sentSections: sections,
			sentAt:       record.sent_at,
		});
	} catch (err) {
		console.error('[feedbackAssignment] sendGapAnalysis:', err.message);
		next(err);
	}
};

// GET /feedback-assignment/cycle-summary?cycleId=xxx
const getCycleSummary = async (req, res, next) => {
	try {
		const { cycleId } = req.query;
		if (!cycleId) return res.status(400).json({ error: 'cycleId is required' });

		const cycle = await Survey.findByPk(cycleId, {
			attributes: ['id', 'name', 'competencies'],
		});
		if (!cycle) return res.status(404).json({ error: 'Cycle not found' });

		const competencyIds = cycle.competencies ?? [];

		// Build questionId → competencyId map
		const questionTypes = await QuestionType.findAll({
			where: { name: 'Feedback360', sub_type: competencyIds },
			include: [{ model: Question, as: 'questions', attributes: ['id'] }],
		});
		const qToComp = {};
		for (const qt of questionTypes)
			for (const q of qt.questions ?? []) qToComp[q.id] = qt.sub_type;

		// All completed assignments in this cycle
		const completed = await FeedbackAssignment.findAll({
			where: { cycle_id: cycleId, status: 'COMPLETED' },
			attributes: ['id', 'scores'],
		});

		const total = await FeedbackAssignment.count({ where: { cycle_id: cycleId } });

		// Aggregate scores per competency across all evaluations
		const scoresByComp = {};
		for (const a of completed) {
			for (const [qId, score] of Object.entries(a.scores ?? {})) {
				const compId = qToComp[qId];
				if (!compId) continue;
				(scoresByComp[compId] = scoresByComp[compId] ?? []).push(Number(score));
			}
		}

		const avg = (arr) => arr.length
			? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
			: null;

		const competencies = competencyIds.map((compId) => ({
			id:      compId,
			average: avg(scoresByComp[compId] ?? []),
		}));

		res.json({
			cycle:        { id: cycle.id, name: cycle.name },
			stats:        { total, completed: completed.length },
			competencies,
		});
	} catch (err) {
		next(err);
	}
};

module.exports = { getAssignments, generateAssignments, updateAssignment, getResults, getGapAnalysis, generateGapAnalysis, sendGapAnalysis, getCycleSummary };
