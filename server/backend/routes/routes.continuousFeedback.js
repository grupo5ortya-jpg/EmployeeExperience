const { Router } = require('express');

const {
    createContinuousFeedback,
    getContinuousFeedbacks,
    getReceivedFeedbacks,
    getSentFeedbacks,
} = require('../controllers/continuous.feedback.controllers');

const router = Router();

router.post('/', createContinuousFeedback);

router.get('/', getContinuousFeedbacks);

router.get('/received/:employeeId', getReceivedFeedbacks);

router.get('/sent/:employeeId', getSentFeedbacks);

module.exports = router;