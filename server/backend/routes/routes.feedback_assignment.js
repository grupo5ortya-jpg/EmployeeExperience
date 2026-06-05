const { Router } = require('express');
const { getAssignments, generateAssignments, updateAssignment, getResults, getGapAnalysis, generateGapAnalysis } = require('../controllers/feedbackAssignment.controllers');
const { authorize } = require('../middleware/authorize');

const router = Router();

router.get('/results',       authorize('Talento', 'Líder', 'Colaborador'), getResults);
router.get('/gap-analysis',  getGapAnalysis);
router.post('/gap-analysis', authorize('Talento'), generateGapAnalysis);
router.get('/',              getAssignments);
router.post('/generate',     authorize('Talento'), generateAssignments);
router.patch('/:id',         updateAssignment);

module.exports = router;
