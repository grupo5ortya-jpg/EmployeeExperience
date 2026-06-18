
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const teams = require('../controllers/team.controllers');

// Composite PK: leaderId + collaboratorId. No update — reassign by delete + create.
router.get('/',                             teams.getAllTeams);
router.get('/:leaderId/:collaboratorId',    teams.getTeamById);
router.post('/',                            authorize('Talento'), teams.createTeam);
router.delete('/:leaderId/:collaboratorId', authorize('Talento'), teams.deleteTeam);

module.exports = router;
