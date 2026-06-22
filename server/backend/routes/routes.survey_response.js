
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const responses = require('../controllers/survey_response.controllers');

// Composite PK: surveyAssignmentId + questionId
// POST/PATCH sin authorize por rol: el propio empleado envía sus respuestas de Pulso vía este
// endpoint (no hay employee_id en SurveyResponse para validar ownership, ver CLAUDE.md).
router.get('/',                                                    responses.getAllResponses);
router.get('/:surveyAssignmentId/:questionId',                     responses.getResponseById);
router.post('/',                                                   responses.createResponse);
router.patch('/:surveyAssignmentId/:questionId',                   responses.updateResponse);
router.delete('/:surveyAssignmentId/:questionId',                  authorize('Talento'), responses.deleteResponse);

module.exports = router;
