const { Team, Employee, Person } = require('../connection/sequelize');

const PERSON_ATTRS = { model: Person, as: 'person', attributes: ['first_name', 'last_name'] };

const TEAM_INCLUDE = [
	{
		model:      Employee,
		as:         'leader',
		attributes: ['id', 'position'],
		include:    [PERSON_ATTRS],
	},
	{
		model:      Employee,
		as:         'collaborator',
		attributes: ['id', 'position'],
		include:    [PERSON_ATTRS],
	},
];

function formatTeam(t) {
	return {
		leaderId:       t.leader_id,
		collaboratorId: t.collaborator_id,
		joinedAt:       t.joined_at,
		leader: t.leader
			? {
				id:        t.leader.id,
				position:  t.leader.position,
				firstName: t.leader.person?.first_name ?? null,
				lastName:  t.leader.person?.last_name  ?? null,
			}
			: null,
		collaborator: t.collaborator
			? {
				id:        t.collaborator.id,
				position:  t.collaborator.position,
				firstName: t.collaborator.person?.first_name ?? null,
				lastName:  t.collaborator.person?.last_name  ?? null,
			}
			: null,
	};
}

const getAllTeams = async (req, res, next) => {
	try {
		const teams = await Team.findAll({ include: TEAM_INCLUDE });
		res.json(teams.map(formatTeam));
	} catch (err) {
		next(err);
	}
};

const getTeamById = async (req, res, next) => {
	try {
		const { leaderId, collaboratorId } = req.params;
		const team = await Team.findOne({
			where:   { leader_id: leaderId, collaborator_id: collaboratorId },
			include: TEAM_INCLUDE,
		});
		if (!team) return res.status(404).json({ status: 'fail', message: 'Team relation not found' });
		res.json(formatTeam(team));
	} catch (err) {
		next(err);
	}
};

const createTeam = async (req, res, next) => {
	try {
		const { leaderId, collaboratorId } = req.body;
		const team = await Team.create({
			leader_id:       leaderId,
			collaborator_id: collaboratorId,
		});
		const full = await Team.findOne({
			where:   { leader_id: team.leader_id, collaborator_id: team.collaborator_id },
			include: TEAM_INCLUDE,
		});
		res.status(201).json(formatTeam(full));
	} catch (err) {
		next(err);
	}
};

// paranoid: true → soft delete
const deleteTeam = async (req, res, next) => {
	try {
		const { leaderId, collaboratorId } = req.params;
		const team = await Team.findOne({
			where: { leader_id: leaderId, collaborator_id: collaboratorId },
		});
		if (!team) return res.status(404).json({ status: 'fail', message: 'Team relation not found' });
		await team.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllTeams,
	getTeamById,
	createTeam,
	deleteTeam,
};
