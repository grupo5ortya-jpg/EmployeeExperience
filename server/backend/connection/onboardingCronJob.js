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

		// Avoid duplicate alerts (one per employee+task combo)
		const existing = await Alert.findOne({
			where: { employee_id: et.employee_id, type: 'ONBOARDING_TASK_OVERDUE' },
		});
		if (existing) continue;

		// Alert for HR
		await Alert.create({
			employee_id: et.employee_id,
			type:        'ONBOARDING_TASK_OVERDUE',
			message:     `${empName} tiene la tarea "${taskName}" vencida.`,
			status:      'UNREAD',
		});

		// Alert for the employee's direct leader
		const leaderTeam = await Team.findOne({ where: { collaborator_id: et.employee_id } });
		if (leaderTeam?.leader_id) {
			const leaderExisting = await Alert.findOne({
				where: { employee_id: leaderTeam.leader_id, type: 'TEAM_TASK_OVERDUE' },
			});
			if (!leaderExisting) {
				await Alert.create({
					employee_id: leaderTeam.leader_id,
					type:        'TEAM_TASK_OVERDUE',
					message:     `${empName} tiene la tarea de onboarding "${taskName}" vencida.`,
					status:      'UNREAD',
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
