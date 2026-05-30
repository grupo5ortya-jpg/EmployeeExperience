const { FeedbackAssignment, Employee, Person, Survey } = require('../connection/sequelize');
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

		if (req.body.status) await assignment.update({ status: req.body.status });

		const updated = await FeedbackAssignment.findByPk(assignment.id);
		const [formatted] = await attachEmployees([updated]);
		res.json(formatted);
	} catch (err) {
		console.error('[feedbackAssignment] updateAssignment:', err.message);
		next(err);
	}
};

module.exports = { getAssignments, generateAssignments, updateAssignment };
