
const { Router } = require('express');
const router = Router();
const teams = require('../controllers/team.controllers');

// Composite PK: leaderId + collaboratorId. No update — reassign by delete + create.
router.get('/',                             teams.getAllTeams);
router.get('/:leaderId/:collaboratorId',    teams.getTeamById);
router.post('/',                            teams.createTeam);
router.delete('/:leaderId/:collaboratorId', teams.deleteTeam);

module.exports = router;
