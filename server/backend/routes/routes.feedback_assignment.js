const { Router } = require('express');
const { getAssignments, generateAssignments, updateAssignment, getResults, getGapAnalysis, generateGapAnalysis, sendGapAnalysis, getCycleSummary } = require('../controllers/feedbackAssignment.controllers');
const { authorize } = require('../middlewares/authorize');

const router = Router();

router.get('/results',            authorize('Talento', 'Líder', 'Colaborador'), getResults);
router.get('/cycle-summary',      authorize('Talento', 'Líder'), getCycleSummary);
router.get('/gap-analysis',       getGapAnalysis);
router.post('/gap-analysis',      authorize('Talento'), generateGapAnalysis);
router.patch('/gap-analysis/send', authorize('Talento'), sendGapAnalysis);
router.get('/',                   getAssignments);
router.post('/generate',          authorize('Talento'), generateAssignments);
router.patch('/:id',              updateAssignment);

module.exports = router;
