
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const assignments = require('../controllers/survey_assignment.controllers');

// Composite PK: surveyId + employeeId + assignedBy
router.get('/',                                              assignments.getAllAssignments);
router.get('/:surveyId/:employeeId/:assignedBy',             assignments.getAssignmentById);
router.post('/',                                             authorize('Talento'), assignments.createAssignment);
// PATCH sin authorize: el propio empleado completa su encuesta (Pulso/360 legacy) vía este endpoint —
// ownership check (self o Talento) se hace dentro del controller.
router.patch('/:surveyId/:employeeId/:assignedBy',           assignments.updateAssignment);
router.delete('/:surveyId/:employeeId/:assignedBy',          authorize('Talento'), assignments.deleteAssignment);

module.exports = router;
