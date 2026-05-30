const { Employee, FeedbackAssignment } = require('./sequelize');

const PEERS_PER_EMPLOYEE = 2;

/**
 * Generates SELF + PEER FeedbackAssignments for a cycle.
 *
 * Rules:
 *   - SELF  → always, for every active employee in the department.
 *   - PEER  → only if the employee has a leader assigned (via Team).
 *             Peers must share the same leader. Up to PEERS_PER_EMPLOYEE,
 *             or as many valid peers as exist (no duplicates).
 *
 * Safe to call multiple times — skips if assignments already exist for the cycle.
 */
async function generateAssignmentsForCycle(cycleId, departmentId) {
	const existing = await FeedbackAssignment.count({ where: { cycle_id: cycleId } });
	if (existing > 0) return { skipped: true };

	const employees = await Employee.findAll({
		where:   { department_id: departmentId, status: 'ACTIVE' },
		attributes: ['id'],
		include: [{
			model:   Employee,
			as:      'leaders',
			through: { attributes: [] },
			attributes: ['id'],
		}],
	});

	if (employees.length === 0) return { created: 0 };

	// Group employee IDs by their leader ID
	const byLeader = {}; // { leaderId: Set<employeeId> }
	for (const emp of employees) {
		const leaderId = emp.leaders?.[0]?.id ?? null;
		if (!leaderId) continue;
		if (!byLeader[leaderId]) byLeader[leaderId] = new Set();
		byLeader[leaderId].add(emp.id);
	}

	const rows = [];

	for (const employee of employees) {
		// SELF — always
		rows.push({
			cycle_id:     cycleId,
			evaluator_id: employee.id,
			evaluated_id: employee.id,
			type:         'SELF',
			status:       'PENDING',
		});

		// PEER — only if employee has a leader
		const leaderId = employee.leaders?.[0]?.id ?? null;
		if (!leaderId) continue;

		const teammates = [...(byLeader[leaderId] ?? [])]
			.filter((id) => id !== employee.id);

		const shuffled = [...teammates].sort(() => Math.random() - 0.5);

		for (const peerId of shuffled.slice(0, PEERS_PER_EMPLOYEE)) {
			rows.push({
				cycle_id:     cycleId,
				evaluator_id: employee.id,
				evaluated_id: peerId,
				type:         'PEER',
				status:       'PENDING',
			});
		}
	}

	await FeedbackAssignment.bulkCreate(rows);
	return { created: rows.length };
}

module.exports = { generateAssignmentsForCycle };
