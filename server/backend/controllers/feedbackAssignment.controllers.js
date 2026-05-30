const { FeedbackAssignment, Employee, Person, Survey, QuestionType, Question } = require('../connection/sequelize');
const { generateAssignmentsForCycle } = require('../connection/feedbackAssignmentService');

async function attachEmployees(assignments) {
	if (assignments.length === 0) return [];

	const ids = [...new Set([
		...assignments.map((a) => a.evaluator_id),
		...assignments.map((a) => a.evaluated_id),
	])];

	const employees = await Employee.findAll({
		where:      { id: ids },
		attributes: ['id', 'position'],
		include:    [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
	});

	const map = Object.fromEntries(employees.map((e) => [e.id, e]));

	const fmt = (id) => {
		const e = map[id];
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
		evaluator: fmt(a.evaluator_id),
		evaluated: fmt(a.evaluated_id),
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
	} catch (err) {
		console.error('[feedbackAssignment] updateAssignment:', err.message);
		next(err);
	}
};

// GET /feedback-assignment/results?cycleId=xxx&evaluatedId=xxx
const getResults = async (req, res, next) => {
	try {
		const { cycleId, evaluatedId } = req.query;
		if (!cycleId || !evaluatedId)
			return res.status(400).json({ error: 'cycleId and evaluatedId are required' });

		// 1. Fetch cycle to get selected competency IDs
		const cycle = await Survey.findByPk(cycleId, { attributes: ['id', 'name', 'competencies'] });
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

		res.json({
			cycle:        { id: cycle.id, name: cycle.name },
			evaluated:    fmtEmp(evaluatedId),
			competencies,
			breakdown,
			stats: {
				completed: assignments.length,
				pending:   pendingCount,
				total:     allAssignments.length,
			},
		});
	} catch (err) {
		console.error('[feedbackAssignment] getResults:', err.message);
		next(err);
	}
};

module.exports = { getAssignments, generateAssignments, updateAssignment, getResults };
