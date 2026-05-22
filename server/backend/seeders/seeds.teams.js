module.exports = async function (sequelize) {
	const { Team, Employee } = sequelize.models;

	const count = await Team.count();
	if (count > 0) return;

	const employees = await Employee.findAll({ limit: 20 });
	if (employees.length < 18) {
		throw new Error('seeds.teams.js requires at least 18 Employee records.');
	}

	// Indices 14-17 are seeded as Líder role — index 17 is the top leader
	const leaderIndices       = [14, 15, 16, 17];
	const collaboratorIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19];

	// Distribute collaborators evenly across the 4 leaders
	const collaboratorTeams = collaboratorIndices.map((collabIdx, i) => ({
		leader_id:       employees[leaderIndices[i % leaderIndices.length]].id,
		collaborator_id: employees[collabIdx].id,
	}));

	// Leaders 14, 15, 16 report to leader 17 (top of hierarchy — no leader)
	const leaderTeams = [14, 15, 16].map(idx => ({
		leader_id:       employees[17].id,
		collaborator_id: employees[idx].id,
	}));

	await Team.bulkCreate([...collaboratorTeams, ...leaderTeams]);
};
