
const { Router } = require('express');
const router = Router();
const assignments = require('../controllers/survey_assignment.controllers');

// Composite PK: surveyId + employeeId + assignedBy
router.get('/',                                              assignments.getAllAssignments);
router.get('/:surveyId/:employeeId/:assignedBy',             assignments.getAssignmentById);
router.post('/',                                             assignments.createAssignment);
router.patch('/:surveyId/:employeeId/:assignedBy',           assignments.updateAssignment);
router.delete('/:surveyId/:employeeId/:assignedBy',          assignments.deleteAssignment);

module.exports = router;
