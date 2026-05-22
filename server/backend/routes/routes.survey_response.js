
const { Router } = require('express');
const router = Router();
const responses = require('../controllers/survey_response.controllers');

// Composite PK: surveyAssignmentId + questionId
router.get('/',                                                    responses.getAllResponses);
router.get('/:surveyAssignmentId/:questionId',                     responses.getResponseById);
router.post('/',                                                   responses.createResponse);
router.patch('/:surveyAssignmentId/:questionId',                   responses.updateResponse);
router.delete('/:surveyAssignmentId/:questionId',                  responses.deleteResponse);

module.exports = router;
