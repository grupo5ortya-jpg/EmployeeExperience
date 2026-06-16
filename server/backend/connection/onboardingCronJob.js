const cron    = require('node-cron');
const { Op }  = require('sequelize');
const { EmployeeTask, Task, Employee, Person, Team, Alert } = require('./sequelize');

const ACTIVE_STATUSES = ['ENROLLED', 'IN_PROGRESS', 'SUBMITTED', 'SUBMITED'];

async function checkOverdueTasks() {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const overdue = await EmployeeTask.findAll({
		where: {
			due_date: { [Op.lt]: today },
			status:   { [Op.in]: ACTIVE_STATUSES },
		},
		include: [
			{ model: Task,     as: 'task',     attributes: ['id', 'name'] },
			{
				model:   Employee,
				as:      'employee',
				attributes: ['id'],
				include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
			},
		],
	});

	if (overdue.length === 0) return;

	for (const et of overdue) {
		const taskName = et.task?.name ?? 'una tarea';
		const empName  = et.employee?.person
			? `${et.employee.person.first_name} ${et.employee.person.last_name}`.trim()
			: 'Un empleado';
		const topics = { taskId: et.task_id };

		// Alert for HR (one per employee+task)
		const hrExisting = await Alert.findOne({
			where: { type: 'ONBOARDING_TASK_OVERDUE', topics: { [Op.contains]: topics } },
		});
		if (!hrExisting) {
			await Alert.create({
				employee_id: et.employee_id,
				type:        'ONBOARDING_TASK_OVERDUE',
				message:     `La tarea "${taskName}" de ${empName} venció.`,
				status:      'UNREAD',
				topics,
			});
		}

		// Alert for the employee themselves (one per employee+task)
		const empExisting = await Alert.findOne({
			where: { employee_id: et.employee_id, type: 'TASK_OVERDUE', topics: { [Op.contains]: topics } },
		});
		if (!empExisting) {
			await Alert.create({
				employee_id: et.employee_id,
				type:        'TASK_OVERDUE',
				message:     `Tu tarea "${taskName}" venció.`,
				status:      'UNREAD',
				topics,
			});
		}

		// Alert for the employee's direct leader (one per leader+task)
		const leaderTeam = await Team.findOne({ where: { collaborator_id: et.employee_id } });
		if (leaderTeam?.leader_id) {
			const leaderExisting = await Alert.findOne({
				where: { employee_id: leaderTeam.leader_id, type: 'TEAM_TASK_OVERDUE', topics: { [Op.contains]: topics } },
			});
			if (!leaderExisting) {
				await Alert.create({
					employee_id: leaderTeam.leader_id,
					type:        'TEAM_TASK_OVERDUE',
					message:     `La tarea "${taskName}" de ${empName} venció.`,
					status:      'UNREAD',
					topics,
				});
			}
		}
	}

	console.log(`onboardingCron: ${overdue.length} tareas vencidas procesadas`);
}

function startOnboardingCronJob() {
	cron.schedule('0 9 * * *', async () => {
		console.log('onboardingCron: verificando tareas vencidas...');
		try { await checkOverdueTasks(); } catch (err) { console.error('onboardingCron error:', err); }
	});
	console.log('onboardingCron: scheduled (daily at 09:00)');
}

module.exports = { startOnboardingCronJob, checkOverdueTasks };
