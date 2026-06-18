const { Router } = require('express');
const { authorize } = require('../middlewares/authorize');

const {
    createContinuousFeedback,
    getContinuousFeedbacks,
    getContinuousFeedbackById,
    getReceivedFeedbacks,
    getSentFeedbacks,
} = require('../controllers/continuous.feedback.controllers');

const router = Router();

router.post('/',                      authorize('Colaborador'), createContinuousFeedback);
router.get('/',                       getContinuousFeedbacks);
router.get('/received/:employeeId',   getReceivedFeedbacks);
router.get('/sent/:employeeId',       getSentFeedbacks);
router.get('/:id',                    getContinuousFeedbackById);

module.exports = router;