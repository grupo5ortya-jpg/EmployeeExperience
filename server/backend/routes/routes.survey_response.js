
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const responses = require('../controllers/survey_response.controllers');

// Composite PK: surveyAssignmentId + questionId
// GET/PATCH/DELETE sin caller real en el frontend (confirmado por grep) -> Talento-only.
// POST sí es real (el propio empleado envía sus respuestas de Pulso) -> sin authorize por rol,
// ownership check dentro del controller (ver EXP-DEV-20-FIX-01 en jira-documentation.md).
router.get('/',                                                    authorize('Talento'), responses.getAllResponses);
router.get('/:surveyAssignmentId/:questionId',                     authorize('Talento'), responses.getResponseById);
router.post('/',                                                   responses.createResponse);
router.patch('/:surveyAssignmentId/:questionId',                   authorize('Talento'), responses.updateResponse);
router.delete('/:surveyAssignmentId/:questionId',                  authorize('Talento'), responses.deleteResponse);

module.exports = router;
