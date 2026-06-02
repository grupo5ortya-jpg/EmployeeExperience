
const { Op } = require('sequelize');

module.exports = async function (sequelize) {
	const { Team, Employee, User, Role } = sequelize.models;

	const count = await Team.count();
	if (count > 0) return;

	const leaderRole = await Role.findOne({ where: { name: 'Líder' } });
	if (!leaderRole) {
		throw new Error('No role found: Líder. Run seeds.roles.js first.');
	}

	const leaderUsers = await User.findAll({ where: { role_id: leaderRole.id } });
	if (leaderUsers.length < 4) {
		throw new Error('seeds.teams.js requires at least 4 users with role Líder.');
	}

	const leaderEmployeeIds = leaderUsers
		.map(user => user.employee_id)
		.filter(Boolean);
	if (leaderEmployeeIds.length < leaderUsers.length) {
		throw new Error('Some Líder users are not linked to an employee.');
	}

	const employees = await Employee.findAll({
		where: {
			id: {
				[Op.notIn]: leaderEmployeeIds,
			},
		},
	});

	if (employees.length < 14) {
		throw new Error('seeds.teams.js requires at least 14 non-leader Employee records.');
	}

	const collaborators = employees.slice(0, 14);
	const leaderTeams = collaborators.map((employee, index) => ({
		leader_id: leaderEmployeeIds[index % leaderEmployeeIds.length],
		collaborator_id: employee.id,
	}));

	await Team.bulkCreate(leaderTeams, { individualHooks: true });
};
