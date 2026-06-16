
const { Router }     = require('express');
const router         = Router();
const exitInterviews = require('../controllers/exitInterview.controller');

router.get('/pending',          exitInterviews.getPendingExitInterviews);
router.post('/:surveyId/submit', exitInterviews.submitExitInterview);

module.exports = router;
