const { Router } = require('express');
const { getAssignments, generateAssignments, updateAssignment, getResults } = require('../controllers/feedbackAssignment.controllers');

const router = Router();

router.get('/results',    getResults);
router.get('/',           getAssignments);
router.post('/generate',  generateAssignments);
router.patch('/:id',      updateAssignment);

module.exports = router;
