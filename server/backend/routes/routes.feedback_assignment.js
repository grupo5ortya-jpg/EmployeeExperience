const { Router } = require('express');
const { getAssignments, generateAssignments, updateAssignment, getResults, getGapAnalysis, generateGapAnalysis } = require('../controllers/feedbackAssignment.controllers');

const router = Router();

router.get('/results',       getResults);
router.get('/gap-analysis',  getGapAnalysis);
router.post('/gap-analysis', generateGapAnalysis);
router.get('/',              getAssignments);
router.post('/generate',     generateAssignments);
router.patch('/:id',         updateAssignment);

module.exports = router;
