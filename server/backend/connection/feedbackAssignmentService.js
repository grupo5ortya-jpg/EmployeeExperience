const { Employee, FeedbackAssignment } = require('./sequelize');

const PEERS_PER_EMPLOYEE = 2;

/**
 * Generates SELF, PEER, LEADER and DIRECT_REPORT FeedbackAssignments for a cycle.
 *
 * Rules:
 *   SELF          → always, for every active employee in the department.
 *   PEER          → same-leader teammates (up to PEERS_PER_EMPLOYEE). Requires leader assigned.
 *   LEADER        → the employee's direct leader evaluates them. Requires leader assigned.
 *   DIRECT_REPORT → each collaborator-within-dept evaluates their leader (if that leader
 *                   is also a department employee and has reports in the dept).
 *
 * Safe to call multiple times — skips if assignments already exist for the cycle.
 */
async function generateAssignmentsForCycle(cycleId, departmentId) {
	const existing = await FeedbackAssignment.count({ where: { cycle_id: cycleId } });
	if (existing > 0) return { skipped: true };

	const employees = await Employee.findAll({
		where:      { department_id: departmentId, status: 'ACTIVE' },
		attributes: ['id'],
		include:    [{
			model:      Employee,
			as:         'leaders',
			through:    { attributes: [] },
			attributes: ['id'],
		}],
	});

	if (employees.length === 0) return { created: 0 };

	const employeeIds = new Set(employees.map(e => e.id));

	// Map: leaderId → Set<collaboratorId> (only within this department)
	const byLeader = {};
	for (const emp of employees) {
		const leaderId = emp.leaders?.[0]?.id ?? null;
		if (!leaderId) continue;
		if (!byLeader[leaderId]) byLeader[leaderId] = new Set();
		byLeader[leaderId].add(emp.id);
	}

	const rows = [];

	for (const employee of employees) {
		const leaderId = employee.leaders?.[0]?.id ?? null;

		// Sin líder y sin reportes directos en el depto → no participa
		const hasReports = byLeader[employee.id]?.size > 0;
		if (!leaderId && !hasReports) continue;

		// SELF — always
		rows.push({
			cycle_id:     cycleId,
			evaluator_id: employee.id,
			evaluated_id: employee.id,
			type:         'SELF',
			status:       'PENDING',
		});

		if (leaderId) {
			// PEER — same-leader teammates, random selection (always within dept)
			const teammates = [...(byLeader[leaderId] ?? [])].filter(id => id !== employee.id);
			const shuffled  = [...teammates].sort(() => Math.random() - 0.5);
			for (const peerId of shuffled.slice(0, PEERS_PER_EMPLOYEE)) {
				rows.push({
					cycle_id:     cycleId,
					evaluator_id: employee.id,
					evaluated_id: peerId,
					type:         'PEER',
					status:       'PENDING',
				});
			}

			// LEADER — only if the leader belongs to this department's cycle
			if (employeeIds.has(leaderId)) {
				rows.push({
					cycle_id:     cycleId,
					evaluator_id: leaderId,
					evaluated_id: employee.id,
					type:         'LEADER',
					status:       'PENDING',
				});
			}
		}

		// DIRECT_REPORT — collaborators within the dept who report to this employee evaluate them
		const directReports = byLeader[employee.id];
		if (directReports && directReports.size > 0) {
			for (const reportId of directReports) {
				rows.push({
					cycle_id:     cycleId,
					evaluator_id: reportId,
					evaluated_id: employee.id,
					type:         'DIRECT_REPORT',
					status:       'PENDING',
				});
			}
		}
	}

	await FeedbackAssignment.bulkCreate(rows, { ignoreDuplicates: true });
	return { created: rows.length };
}

module.exports = { generateAssignmentsForCycle };
